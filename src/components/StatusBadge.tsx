import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

type StatusType = 'present' | 'absent' | 'late';

export default function StatusBadge({ type }: { type: StatusType }) {
  const config = {
    present: { label: 'Present', color: Colors.primary },
    late: { label: 'Late', color: '#E65100' }, // Burnt Orange
    absent: { label: 'Absent', color: Colors.error },
  };

  return (
    <View style={[styles.badge, { borderColor: config[type].color }]}>
      <Text style={[styles.text, { color: config[type].color }]}>
        {config[type].label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
});
