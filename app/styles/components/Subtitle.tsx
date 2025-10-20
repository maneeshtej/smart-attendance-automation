// app/components/Subtitle.tsx
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

interface SubtitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

const Subtitle: React.FC<SubtitleProps> = ({ children, style }) => (
  <Text style={[styles.subtitle, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default Subtitle;
