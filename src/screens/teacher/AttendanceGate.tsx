import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useAuth } from '../../hooks/AuthContext';
import { teacherService } from '../../services/teacherServices';
import { ClassSession } from '../../types/attendance';
import { Colors } from '../../theme/colors';

const AttendanceGate = ({ navigation }: any) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const rnBiometrics = new ReactNativeBiometrics();

  // 1. ALL-IN-ONE PERMISSION HANDLER
  const askPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const apiLevel = Platform.Version;

        if (apiLevel >= 31) {
          // Android 12+ Permissions
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);

          return (
            granted['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
            granted['android.permission.BLUETOOTH_ADVERTISE'] === 'granted' &&
            granted['android.permission.BLUETOOTH_SCAN'] === 'granted'
          );
        } else {
          // Android 11 and below
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
    return true; // iOS handles this via Info.plist automatically
  };

  const handleUnlock = async () => {
    // A. Ask for Radio Permissions first
    const radioReady = await askPermissions();

    if (!radioReady) {
      Alert.alert(
        'Permissions Required',
        'This app needs Bluetooth and Location to broadcast your presence to students.',
      );
      return;
    }

    // B. If Radio is ready, do Biometrics
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Verify Identity',
      });

      if (success) {
        setIsUnlocked(true);
        const data = await teacherService.getTodaysClasses(user?.id || '');
        setClasses(data);
      }
    } catch (error) {
      console.log('Biometrics failed or unavailable', error);
      // Fallback: If hardware is broken, let them in for testing
      setIsUnlocked(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.brandText}>Security Layer</Text>
        <Text style={styles.userText}>Verify Access</Text>

        {!isUnlocked ? (
          /* AUTH HERO CARD */
          <TouchableOpacity
            style={styles.heroCard}
            onPress={handleUnlock}
            activeOpacity={0.9}
          >
            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle}>Unlock Biometrics</Text>
              <Text style={styles.heroSubtitle}>
                Touch ID or Face ID required
              </Text>
            </View>
            <View style={styles.heroAction}>
              <Text style={styles.heroIcon}>🔒</Text>
            </View>
          </TouchableOpacity>
        ) : (
          /* CLASS SELECTION LIST */
          <View style={styles.listSection}>
            <Text style={styles.sectionLabel}>Active Sessions Today</Text>

            {classes.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.classCard}
                onPress={() => {
                  // Functional Routing: Passing the full class object (the payload)
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'ScanningPhase',
                        params: {
                          // This payload contains short_class_id, teacher_id, and subjects
                          classData: item,
                        },
                      },
                    ],
                  });
                }}
              >
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{item.name}</Text>
                  <Text style={styles.classMeta}>
                    {item.subjects?.code} • Sec {item.section}
                  </Text>
                </View>
                <Text style={styles.goArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 24, paddingTop: 60 },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  userText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: 30,
  },

  // MATCHES YOUR HERO CARD STYLE
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    padding: 28,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
  },
  heroInfo: { flex: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  heroAction: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIcon: { fontSize: 20 },

  // CLASS CARDS (Matching your Skeleton Card geometry)
  listSection: { marginTop: 10 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  classInfo: { flex: 1 },
  className: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  classMeta: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  goArrow: { fontSize: 20, fontWeight: '800', color: Colors.primary },
});

export default AttendanceGate;
