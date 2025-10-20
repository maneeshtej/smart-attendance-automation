import React, { forwardRef } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { colors } from '../theme/colors';

interface PrimaryInputProps extends TextInputProps {
  value: string;
  onChangeText?: (text: string) => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

// forwardRef allows parent to use ref for focus(), etc.
const InputField = forwardRef<TextInput, PrimaryInputProps>(
  ({ value, onChangeText, style, inputStyle, ...props }, ref) => (
    <View style={[styles.container, style]}>
      <TextInput
        ref={ref}
        style={[styles.input, inputStyle]}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
  ),
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default InputField;
