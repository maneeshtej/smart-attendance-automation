import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  NativeEventEmitter,
  NativeModules,
  StyleSheet,
} from 'react-native';

import PrimaryButton from '../../../../styles/components/PrimaryButton';
import Subtitle from '../../../../styles/components/Subtitle';
import Card from '../../../../styles/components/Card';
import { colors } from '../../../../styles/theme/colors';
import { useAttendanceStore } from '../../../../state/ble/useAttendanceStore';

const { BleModule } = NativeModules;
const bleEmitter = new NativeEventEmitter(BleModule);

const WhileScanning = ({
  subjectId,
  onSuccess,
  onError,
}: {
  subjectId: string;
  onSuccess: (students: string[]) => void;
  onError: (msg: string) => void;
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [students, setStudents] = useState<string[]>([]);
  const [acks, setAcks] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const { currentSession, addRecordLocal } = useAttendanceStore();

  useEffect(() => {
    const safeSetLog = (msg: string) => {
      try {
        setLogs(prev => [`${msg}`, ...prev]);
      } catch (err) {
        console.error('setLogs failed:', err);
      }
    };

    const subs = [
      bleEmitter.addListener('bleStatus', msg => {
        console.log('[bleStatus]', msg);
        safeSetLog(`[STATUS] ${msg}`);
      }),
      bleEmitter.addListener('studentDetected', id => {
        console.log('[studentDetected]', id);
        try {
          setStudents(prev => [...new Set([...prev, id])]);
          safeSetLog(`[STUDENT DETECTED] ${id}`);

          // ✅ Add to attendance records store
          if (currentSession) {
            addRecordLocal(id);
            safeSetLog(
              `[RECORD ADDED] Student ${id} added to session ${currentSession.id}`,
            );
          } else {
            safeSetLog(`[WARN] No active session — record not saved.`);
          }
        } catch (e) {
          console.error('studentDetected failed:', e);
        }
      }),
      bleEmitter.addListener('ackBroadcast', msg => {
        console.log('[ackBroadcast]', msg);
        try {
          setAcks(prev => [...prev, msg]);
          safeSetLog(`[ACK SENT] ${msg}`);
        } catch (e) {
          console.error('ackBroadcast failed:', e);
        }
      }),
      bleEmitter.addListener('bleError', err => {
        console.error('[bleError]', err);
        safeSetLog(`[ERROR] ${err}`);
        onError(err);
      }),
    ];

    return () => subs.forEach(s => s.remove());
  }, []);

  const startBLE = () => {
    try {
      BleModule.startTeacherMode(subjectId);
      setIsScanning(true);
      setLogs(prev => [
        `[INFO] Started scan for subject ${subjectId}`,
        ...prev,
      ]);
    } catch (err: any) {
      console.log('Failed to start BLE scan:', err);
      onError(err?.message || 'Failed to start a scan');
    }
  };

  const stopBLE = () => {
    BleModule.stopAll();
    setIsScanning(false);
    setLogs(prev => [`[INFO] Stopped BLE`, ...prev]);
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s !== id));
    setLogs(prev => [`[INFO] Removed student ${id}`, ...prev]);
  };

  const submitStudents = () => {
    if (students.length === 0) {
      setLogs(prev => [`[WARN] No students to submit`, ...prev]);
      return;
    }
    // stop scan + clear list on native side
    stopBLE();
    setLogs(prev => [`[INFO] Submitted ${students.length} students`, ...prev]);
    onSuccess(students);
  };

  return (
    <View style={localStyles.wrapper}>
      <ScrollView
        contentContainerStyle={localStyles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={localStyles.heading}>
          {isScanning ? 'Scanning and sending ACKs…' : 'Ready to scan'}
        </Text>

        <PrimaryButton
          onPress={startBLE}
          disabled={isScanning}
          style={localStyles.actionBtn}
        >
          {isScanning ? 'Scanning…' : 'Start BLE Scan'}
        </PrimaryButton>

        {isScanning && (
          <PrimaryButton
            onPress={stopBLE}
            style={[localStyles.actionBtn, { backgroundColor: '#E53935' }]}
            textStyle={{ color: '#fff' }}
          >
            Stop Scanning
          </PrimaryButton>
        )}
        <Subtitle>Detected Students</Subtitle>

        <View style={localStyles.section}>
          {students.length === 0 && (
            <Text style={localStyles.empty}>No students detected yet.</Text>
          )}
          {students.map(id => (
            <Card key={id} style={localStyles.card}>
              <View style={localStyles.cardRow}>
                <Text style={localStyles.cardText}>Student ID: {id}</Text>
                <PrimaryButton
                  onPress={() => removeStudent(id)}
                  style={localStyles.removeBtn}
                  textStyle={{ color: '#fff', fontSize: 13 }}
                >
                  Remove
                </PrimaryButton>
              </View>
            </Card>
          ))}
        </View>

        {/* Spacer so last items don’t hide behind floating button */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {students.length > 0 && (
        <View style={localStyles.floatingBtnContainer}>
          <PrimaryButton
            onPress={submitStudents}
            style={localStyles.floatingBtn}
            textStyle={{ color: '#fff' }}
          >
            Submit Students
          </PrimaryButton>
        </View>
      )}
    </View>
  );
};

export default WhileScanning;

const localStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 100, // extra space for floating button
    backgroundColor: colors.background,
    gap: 15,
  },
  heading: { fontSize: 16, color: colors.textPrimary },
  section: { flex: 1, gap: 15 },
  empty: { color: '#777', fontSize: 14, marginTop: 4 },
  card: {},
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: { color: colors.textPrimary, fontSize: 15 },
  removeBtn: {
    backgroundColor: '#E53935',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  actionBtn: { marginVertical: 6 },
  floatingBtnContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  floatingBtn: {
    // paddingVertical: 14,
    // alignItems: 'center',
    // borderRadius: 12,
    // width: '100%',
  },
});
