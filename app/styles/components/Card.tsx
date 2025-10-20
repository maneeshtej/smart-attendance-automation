// app/components/Card.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../theme/colors';

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  elevated?: boolean; // adds stronger shadow if needed
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  onPress,
  style,
  titleStyle,
  elevated = false,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.card, elevated && styles.elevated, style]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {title ? <Text style={[styles.title, titleStyle]}>{title}</Text> : null}
      <View style={styles.content}>{children}</View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  content: {
    flexDirection: 'column',
    gap: 6,
  },
});

export default Card;
