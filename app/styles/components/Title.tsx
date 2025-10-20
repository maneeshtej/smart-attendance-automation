// app/components/Title.tsx
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

interface TitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

const Title: React.FC<TitleProps> = ({ children, style }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 10,
  },
});

export default Title;
