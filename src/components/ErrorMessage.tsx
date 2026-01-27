// components/ErrorMessage.tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text style={styles.errorText}>{message}</Text>;
}

const styles = StyleSheet.create({
  errorText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'left',
  },
});
