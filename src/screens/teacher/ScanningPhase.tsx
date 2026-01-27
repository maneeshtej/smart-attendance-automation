import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  NativeModules,
  NativeEventEmitter,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BleController } from '../../ble/BleController';
import { teacherService } from '../../services/teacherServices';
import { Colors } from '../../theme/colors';

const { BleScannerModule } = NativeModules;
const nativeEmitter = new NativeEventEmitter(BleScannerModule);

const ScanningPhase = ({ route, navigation }: any) => {
  const { classData } = route.params;

  // State
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [capturedStudents, setCapturedStudents] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isBroadcasting, setIsBroadcasting] = useState(true);
  const [isScanningForStudents, setIsScanningForStudents] = useState(false);
  const [debugRawNames, setDebugRawNames] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const rosterRef = useRef<any[]>([]);
  const isMounted = useRef(true); // Ref to kill the loop immediately

  useEffect(() => {
    let countdown: any;
    isMounted.current = true;

    const subscription = nativeEmitter.addListener('onDeviceFound', data => {
      const rawName = data.name || '';
      if (rawName.startsWith('SD')) {
        const detectedLocalId = rawName.replace('SD', '');
        setCapturedStudents(prev => {
          if (prev.find(s => s.student_id === detectedLocalId)) return prev;
          const studentMatch = rosterRef.current.find(
            s => s.local_student_id?.toString() === detectedLocalId,
          );
          if (!studentMatch) return prev;

          return [
            {
              id: `${data.id}-${detectedLocalId}`,
              student_id: detectedLocalId,
              user_uuid: studentMatch.id,
              name: studentMatch.name,
              avatarUrl: studentMatch.avatarUrl,
              isHardwareVerified: true,
              present: true,
              ack: false,
            },
            ...prev,
          ];
        });
      }
    });

    const startSession = async () => {
      try {
        const students = await teacherService.getStudentsByClass(classData.id);
        rosterRef.current = students;
        setEnrolledCount(students.length);

        await BleController.startAttendanceBroadcast(
          `AD${classData.short_class_id}`,
        );

        countdown = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              transitionToScanning();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        console.error('🚀 Init Error:', err);
      }
    };

    const transitionToScanning = async () => {
      setIsBroadcasting(false);
      await BleController.stopBroadcast();
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsScanningForStudents(true);

      // INTERLEAVED LOOP: Scanning and ACK Bursting
      while (isMounted.current) {
        BleScannerModule.startNativeScan();
        await new Promise(resolve => setTimeout(resolve, 5000));

        if (!isMounted.current) break;

        BleScannerModule.stopNativeScan();
        await new Promise(resolve => setTimeout(resolve, 500));

        let idsToAck: string[] = [];
        setCapturedStudents(current => {
          idsToAck = current.slice(0, 5).map(s => s.student_id);
          return current;
        });

        if (idsToAck.length > 0 && isMounted.current) {
          const ackString = `AK${idsToAck.join('N')}`;
          console.log(`📢 ACK Burst: ${ackString}`);
          await BleController.startAttendanceBroadcast(ackString);
          await new Promise(resolve => setTimeout(resolve, 1500));
          await BleController.stopBroadcast();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    };

    startSession();

    return () => {
      isMounted.current = false;
      clearInterval(countdown);
      subscription.remove();
      BleScannerModule.stopNativeScan();
      BleController.stopBroadcast();
    };
  }, [classData.id, classData.short_class_id]);

  const handleFinishAttendance = async () => {
    try {
      setIsSaving(true);
      isMounted.current = false; // Kill the loop

      BleScannerModule.stopNativeScan();
      await BleController.stopBroadcast();

      await teacherService.finalizeAttendanceSession(
        classData.id,
        classData.teacher_id,
        capturedStudents,
      );

      Alert.alert(
        'Success',
        `Attendance recorded for ${capturedStudents.length} students.`,
      );
      navigation.navigate('TeacherHome', { refresh: true });
    } catch (err) {
      console.error('❌ Save Error:', err);
      Alert.alert('Upload Failed', 'Could not save records to database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.brandText}>
          {isBroadcasting ? 'Phase 1: Broadcasting' : 'Phase 2: Scanning'}
        </Text>
        <Text style={styles.statusText}>
          {isBroadcasting ? `${timeLeft}s` : '🔍'}
        </Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroInfo}>
          <Text style={styles.className}>{classData.name}</Text>
          <Text style={styles.classMeta}>{classData.subjects?.code}</Text>
        </View>
        <View style={styles.statsBadge}>
          <Text style={styles.badgeNumber}>
            {capturedStudents.length}/{enrolledCount}
          </Text>
          <Text style={styles.badgeLabel}>PRESENT</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${
                enrolledCount > 0
                  ? (capturedStudents.length / enrolledCount) * 100
                  : 0
              }%`,
            },
          ]}
        />
      </View>

      <View style={styles.contentArea}>
        <Text style={styles.sectionLabel}>Detected Students</Text>
        <FlatList
          data={capturedStudents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.studentRow}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.checkIcon}>✅</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Waiting for student signals...</Text>
          }
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isSaving && { opacity: 0.7 }]}
        onPress={handleFinishAttendance}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Finish and Submit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 24 },
  header: { marginTop: 40, alignItems: 'center', marginBottom: 20 },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  statusText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
  },
  heroInfo: { flex: 1 },
  className: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  classMeta: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 2,
  },
  statsBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 18,
    alignItems: 'center',
    minWidth: 80,
  },
  badgeNumber: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  badgeLabel: { fontSize: 9, fontWeight: '800', color: '#FFF' },
  progressContainer: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: '#10B981' },
  contentArea: { flex: 1, marginTop: 30 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  studentName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  checkIcon: { fontSize: 16 },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: Colors.textPrimary,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

export default ScanningPhase;
