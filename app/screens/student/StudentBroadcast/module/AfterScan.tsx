import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Card from '../../../../styles/components/Card';
import PrimaryButton from '../../../../styles/components/PrimaryButton';
import Subtitle from '../../../../styles/components/Subtitle';
import { colors } from '../../../../styles/theme/colors';
import { SubjectMap } from '../../../../config/SubjectMap';

interface AfterScanProps {
  subject?: string | null;
  onReset: () => void;
}

const AfterScan: React.FC<AfterScanProps> = ({ subject, onReset }) => {
  console.log(subject);
  const subjectName = SubjectMap.find(item => item.code === subject)?.subject;
  console.log(subjectName);
  return (
    <View style={styles.container}>
      <Subtitle style={styles.title}>Attendance Summary</Subtitle>

      <Text style={styles.info}>
        Subject: <Text style={styles.highlight}>{subjectName || '—'}</Text>
      </Text>

      <PrimaryButton
        style={styles.resetBtn}
        onPress={onReset}
        textStyle={{ color: '#fff' }}
      >
        New Scan
      </PrimaryButton>
    </View>
  );
};

export default AfterScan;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 12 },
  info: { fontSize: 15, color: colors.textSecondary, marginBottom: 6 },
  highlight: { color: colors.textPrimary, fontWeight: '600' },
  scroll: { marginTop: 10, maxHeight: 300 },
  studentText: { color: colors.textPrimary, fontSize: 15 },
  empty: { color: '#777', textAlign: 'center', marginTop: 20 },
  resetBtn: {
    backgroundColor: '#4CAF50',
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
