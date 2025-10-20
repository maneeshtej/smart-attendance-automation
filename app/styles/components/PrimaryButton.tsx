// app/components/PrimaryButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../theme/colors';

interface PrimaryButtonProps {
  children: React.ReactNode; // now supports any React content
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onPress,
  style,
  textStyle,
  disabled = false,
}) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.disabled, style]}
    onPress={onPress}
    activeOpacity={0.85}
    disabled={disabled}
  >
    {/* If the child is plain text, style it like a label */}
    {typeof children === 'string' ? (
      <Text style={[styles.text, textStyle]}>{children}</Text>
    ) : (
      children
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default PrimaryButton;
