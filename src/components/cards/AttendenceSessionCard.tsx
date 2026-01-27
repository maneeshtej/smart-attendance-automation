import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { AttendanceSession } from '../../types/attendance';

interface AttendanceCardProps {
  session: AttendanceSession;
  displayName: string;
  onPress: (id: string) => void;
}

export const AttendanceSessionCard = ({
  session,
  displayName,
  onPress,
}: AttendanceCardProps) => {
  const date = new Date(session.started_at);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(session.id)}
      activeOpacity={0.7}
    >
      <View style={styles.dateBox}>
        <Text style={styles.day}>{date.getDate()}</Text>
        <Text style={styles.month}>
          {date.toLocaleString('en-US', { month: 'short' })}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.className} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.time}>
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  dateBox: {
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    minWidth: 55,
  },
  day: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  month: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  info: { flex: 1, marginLeft: 16 },
  className: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  time: { fontSize: 13, color: '#64748B', marginTop: 2 },
  arrowContainer: { marginLeft: 8 },
  arrow: { fontSize: 18, color: '#CBD5E1', fontWeight: '600' },
});
