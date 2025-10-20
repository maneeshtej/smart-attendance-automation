import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  NativeEventEmitter,
  NativeModules,
  StyleSheet,
} from 'react-native';

import { colors } from '../../../../styles/theme/colors';
import PrimaryButton from '../../../../styles/components/PrimaryButton';
import Subtitle from '../../../../styles/components/Subtitle';
import Card from '../../../../styles/components/Card';
import { useAuthStore } from '../../../../state/auth/useAuthStore';
import Title from '../../../../styles/components/Title';

const { BleModule } = NativeModules;
const bleEmitter = new NativeEventEmitter(BleModule);

const StudentScanning = ({
  onSuccess,
  onError,
}: {
  onSuccess: (subjectId: string) => void;
  onError: () => void;
}) => {
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [ack, setAck] = useState<string | null>(null);
  const { user } = useAuthStore();
  const studentId = user?.deviceId || '100';

  // Safe log setter
  const safeSetLog = (msg: string) => {
    try {
      setLogs(prev => [`${msg}`, ...prev]);
    } catch (err) {
      console.error('setLogs failed:', err);
    }
  };

  useEffect(() => {
    const subs = [
      bleEmitter.addListener('bleStatus', msg => {
        console.log('[bleStatus]', msg);
        safeSetLog(`[STATUS] ${msg}`);
      }),
      bleEmitter.addListener('bleError', err => {
        console.error('[bleError]', err);
        safeSetLog(`[ERROR] ${err}`);
        onError();
      }),
      bleEmitter.addListener('ackReceived', msg => {
        console.log('[ackReceived]', msg);
        safeSetLog(`[ACK RECEIVED] ${msg}`);
        setAck(msg);
        setIsActive(false);
        onSuccess(msg.split(' ').pop());
      }),
    ];

    return () => subs.forEach(s => s.remove());
  }, []);

  const startBLE = () => {
    if (!studentId.trim()) {
      safeSetLog('[WARN] Enter a valid Student ID before starting.');
      return;
    }
    try {
      BleModule.startStudentMode(studentId.trim());
      setIsActive(true);
      safeSetLog(`[INFO] Started BLE as student ${studentId}`);
    } catch (err) {
      console.log('Failed to start BLE:', err);
      onError();
    }
  };

  const stopBLE = () => {
    try {
      BleModule.stopAll();
      setIsActive(false);
      safeSetLog('[INFO] BLE stopped manually.');
    } catch (e) {
      safeSetLog(`[ERROR] Stop failed: ${e}`);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Title>
          {' '}
          {isActive
            ? `Advertising as AB:${studentId || '???'}:Z`
            : 'Ready to start as Student'}
        </Title>
        <Subtitle>{`Student ID : ${user?.deviceId || 'none'}`}</Subtitle>
        <PrimaryButton
          onPress={startBLE}
          disabled={isActive}
          style={styles.actionBtn}
        >
          {isActive ? 'Advertising…' : 'Start Student Mode'}
        </PrimaryButton>

        {isActive && (
          <PrimaryButton
            onPress={stopBLE}
            style={[styles.actionBtn, { backgroundColor: '#E53935' }]}
            textStyle={{ color: '#fff' }}
          >
            Stop Advertising
          </PrimaryButton>
        )}

        <Subtitle>BLE Logs</Subtitle>
        <Card style={styles.logCard}>
          {logs.length === 0 ? (
            <Text style={styles.empty}>No logs yet.</Text>
          ) : (
            logs.map((l, i) => (
              <Text key={i} style={styles.log}>
                {l}
              </Text>
            ))
          )}
        </Card>

        {ack && (
          <View style={styles.ackContainer}>
            <Text style={styles.ackText}>{ack}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {isActive && (
        <View style={styles.floatingBtnContainer}>
          <PrimaryButton
            onPress={stopBLE}
            style={styles.floatingBtn}
            textStyle={{ color: '#fff' }}
          >
            Stop BLE
          </PrimaryButton>
        </View>
      )}
    </View>
  );
};

export default StudentScanning;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 100,
    gap: 15,
  },
  heading: { fontSize: 16, color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  actionBtn: { marginVertical: 6 },
  logCard: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  log: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  empty: { color: '#777', fontSize: 14 },
  ackContainer: {
    marginTop: 10,
    backgroundColor: '#C8E6C9',
    padding: 12,
    borderRadius: 8,
  },
  ackText: { color: '#2E7D32', fontSize: 15, textAlign: 'center' },
  floatingBtnContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  floatingBtn: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    width: '100%',
  },
});
