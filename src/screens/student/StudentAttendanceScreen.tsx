import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  NativeModules,
  NativeEventEmitter,
  ActivityIndicator,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useAuth } from '../../hooks/AuthContext';
import { Colors } from '../../theme/colors';
import { studentService } from '../../services/studentServices';
import { BleController } from '../../ble/BleController';

const { BleScannerModule } = NativeModules;
const nativeEmitter = new NativeEventEmitter(BleScannerModule);
const rnBiometrics = new ReactNativeBiometrics();

const StudentAttendanceScreen = () => {
  const { user } = useAuth();

  // UI State
  const [status, setStatus] = useState('Authenticating...');
  const [log, setLog] = useState('Waiting for biometrics...');
  const [classDetails, setClassDetails] = useState<any>(null);

  // 1. The Cancel Function
  const handleCancel = async () => {
    isVerifyingRef.current = false; // Stops the loop recursion
    setStatus('Cancelled');
    setLog('Attendance process stopped by user.');

    // Immediate radio kill
    BleScannerModule.stopNativeScan();
    await BleController.stopBroadcast();
  };

  // Logic State
  const isVerifyingRef = useRef(false);

  const askPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 31) {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);

          return (
            granted['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
            granted['android.permission.BLUETOOTH_ADVERTISE'] === 'granted' &&
            granted['android.permission.BLUETOOTH_CONNECT'] === 'granted'
          );
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // 1. Initial Lifecycle
  useEffect(() => {
    const initialize = async () => {
      const hasPermission = await askPermissions();
      if (hasPermission) {
        setStatus('Authenticating...');
        setLog('Waiting for biometrics...');
        handleInitialAuth();
      } else {
        setStatus('Permission Denied');
        setLog('Bluetooth permissions are required for attendance.');
        Alert.alert(
          'Permission Error',
          'Please enable Bluetooth and Location permissions in settings.',
        );
      }
    };

    initialize();

    return () => {
      isVerifyingRef.current = false;
      BleScannerModule.stopNativeScan();
      BleController.stopBroadcast();
    };
  }, []);

  // 2. Step 1: Biometrics
  const handleInitialAuth = async () => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Confirm Attendance',
        cancelButtonText: 'Cancel',
      });

      if (success) {
        setStatus('Scanning...');
        setLog('Searching for teacher signal (AD)...');
        startPhaseAScan();
      } else {
        setLog('Authentication failed.');
      }
    } catch (error) {
      setLog('Auth Error - Proceeding anyway');
      startPhaseAScan();
    }
  };

  // 3. Step 2: Find Teacher Signal (Phase A)
  const startPhaseAScan = () => {
    BleScannerModule.startNativeScan();
    const subscription = nativeEmitter.addListener('onDeviceFound', data => {
      const deviceName = data.name || '';
      if (deviceName.startsWith('AD')) {
        BleScannerModule.stopNativeScan();
        subscription.remove();
        handleTeacherFound(deviceName);
      }
    });
  };

  // 4. Step 3: Verify Enrollment & Start Handshake
  const handleTeacherFound = async (signalName: string) => {
    const shortId = signalName.replace('AD', '');
    try {
      setLog(`Checking enrollment for Class #${shortId}...`);
      const details = await studentService.verifyAndGetClassDetails(
        user?.id || '',
        shortId,
      );

      if (!details) {
        setLog('❌ Not enrolled in this class.');
        return;
      }

      setClassDetails(details);

      // Start the Listener for the Teacher's "AK" burst
      startAcknowledgeListener(details.localStudentId);

      // Start the 1-2-1 Handshake Loop
      startHandshakeLoop(details.localStudentId);
    } catch (error) {
      setLog('❌ Connection Error');
      console.error(error);
    }
  };

  // 5. Step 4: The Handshake Loop (1s Listen -> 2s Gap -> 1s Shout)
  const startHandshakeLoop = async (sid: number) => {
    isVerifyingRef.current = true;

    const runCycle = async () => {
      if (!isVerifyingRef.current) return;

      try {
        // --- PHASE 0: NUCLEAR CLEANUP (800ms) ---
        // We force everything to stop and wait nearly a full second.
        // This prevents the "null object reference" by letting Android's GC clean up the GATT server.
        setStatus('COOLING DOWN');
        BleScannerModule.stopNativeScan();
        await BleController.stopBroadcast();
        await new Promise(r => setTimeout(r, 800));

        if (!isVerifyingRef.current) return;

        // --- PHASE 1: THE BIG LISTEN (7 Seconds) ---
        // Priority 1: Catching the teacher's rare 500ms burst.
        setStatus('LISTENING');
        setLog('👂 Monitoring for teacher confirmation...');
        BleScannerModule.startNativeScan();

        // Wait 7s to ensure overlap with teacher's 5s cycle
        await new Promise(r => setTimeout(r, 7000));

        if (!isVerifyingRef.current) return;

        // --- PHASE 2: SCAN CLEANUP (500ms) ---
        BleScannerModule.stopNativeScan();
        await new Promise(r => setTimeout(r, 500));

        if (!isVerifyingRef.current) return;

        // --- PHASE 3: THE SHORT SHOUT (1.2 Seconds) ---
        // Priority 2: Letting the teacher see you.
        setStatus('BROADCASTING');
        setLog(`📡 Sending Student ID: ${sid}`);

        // Explicitly stop again right before starting to clear any lingering null refs
        await BleController.stopBroadcast();
        await new Promise(r => setTimeout(r, 200));

        await BleController.startAttendanceBroadcast(`SD${sid}`);
        await new Promise(r => setTimeout(r, 1200));

        // --- PHASE 4: FINAL SETTLE ---
        await BleController.stopBroadcast();

        if (isVerifyingRef.current) runCycle();
      } catch (e) {
        // If we hit that "null object reference", the Bluetooth stack is toast.
        // We wait 3 seconds for the OS to restart the Bluetooth HAL.
        console.log('Radio HAL hit a snag, rebooting loop...');
        setTimeout(runCycle, 3000);
      }
    };

    runCycle();
  };

  // 6. Step 5: The "AK" Listener
  const startAcknowledgeListener = (sid: number) => {
    const subscription = nativeEmitter.addListener('onDeviceFound', data => {
      // 1. Clean the name (remove null bytes and whitespace)
      const rawName = (data.name || '').trim().replace(/\0/g, '');

      // 2. Check for the AK prefix
      if (rawName.startsWith('AK')) {
        /* Logic: 
         If rawName is "AK8N12N15"
         .replace('AK', '') -> "8N12N15"
         .split('N') -> ["8", "12", "15"]
      */
        const confirmedIds = rawName
          .replace('AK', '')
          .split('N')
          .map(id => id.trim());

        console.log(`📡 Parsed IDs: ${confirmedIds} | Looking for: ${sid}`);

        // 3. Match against the student's local ID
        if (confirmedIds.includes(sid.toString())) {
          // SUCCESS: Stop everything
          isVerifyingRef.current = false;
          setStatus('Verified ✅');
          setLog('Attendance marked successfully!');

          // Final Radio Cleanup
          BleScannerModule.stopNativeScan();
          BleController.stopBroadcast();

          // Remove this specific listener
          subscription.remove();
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.statusLabel}>{status}</Text>

        {(status === 'Scanning...' ||
          status === 'LISTENING' ||
          status === 'BROADCASTING' ||
          status === 'COOLING DOWN') && (
          <ActivityIndicator color={Colors.primary} style={{ margin: 20 }} />
        )}

        {classDetails && (
          <View style={styles.detailsBox}>
            <Text style={styles.subjectText}>{classDetails.subjectName}</Text>
            <Text style={styles.teacherText}>
              Prof. {classDetails.teacherName}
            </Text>
          </View>
        )}

        <View style={styles.divider} />
        <Text style={styles.logText}>{log}</Text>

        {/* 2. THE BUTTON UI */}
        {status !== 'Verified ✅' && status !== 'Cancelled' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel Check-in</Text>
          </TouchableOpacity>
        )}

        {/* Optional: Show a "Try Again" if cancelled */}
        {status === 'Cancelled' && (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: Colors.primary }]}
            onPress={() => handleInitialAuth()}
          >
            <Text style={[styles.cancelButtonText, { color: '#FFF' }]}>
              Restart Process
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    elevation: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  detailsBox: { alignItems: 'center', marginBottom: 20 },
  subjectText: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  teacherText: { fontSize: 16, color: '#64748B', marginTop: 4 },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  logText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
  },
  // NEW BUTTON STYLES
  cancelButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#FFF1F2', // Soft Red
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#E11D48', // Deep Red
    fontWeight: '700',
    fontSize: 14,
  },
});

export default StudentAttendanceScreen;
