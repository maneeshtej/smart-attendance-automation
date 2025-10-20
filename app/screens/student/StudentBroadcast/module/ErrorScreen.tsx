// src/pages/StudentBroadcast/module/ErrorScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from '../../../../styles/components/PrimaryButton';
import { colors } from '../../../../styles/theme/colors';

const ErrorScreen = ({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>Something went wrong</Text>
    <Text style={styles.message}>
      {message || 'An unknown BLE error occurred.'}
    </Text>

    <PrimaryButton
      onPress={onRetry}
      style={styles.retryButton}
      textStyle={{ color: '#fff' }}
    >
      Try Again
    </PrimaryButton>
  </View>
);

export default ErrorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  message: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.primary || '#6C63FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
