// app/components/HeaderBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import Title from './Title';
import { styles } from '../global/styles';

interface HeaderBarProps {
  title?: string;
  onBackPress?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  showShadow?: boolean;
}

const Header: React.FC<HeaderBarProps> = ({
  title = '',
  onBackPress,
  rightLabel,
  onRightPress,
  showShadow = false,
}) => {
  return (
    <View style={[localStyles.container, showShadow && localStyles.shadow]}>
      <View style={localStyles.leftGroup}>
        {onBackPress && (
          <TouchableOpacity
            style={localStyles.leftButton}
            onPress={onBackPress}
          >
            <Text
              style={[{ color: colors.textPrimary }, styles.title]}
            >{`<`}</Text>
          </TouchableOpacity>
        )}

        <Text numberOfLines={1}>
          <Title>{title}</Title>
        </Text>
      </View>

      {rightLabel ? (
        <TouchableOpacity
          style={localStyles.rightButton}
          onPress={onRightPress}
        >
          <Text style={localStyles.rightLabel}>{rightLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View style={localStyles.rightPlaceholder} />
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // ensures title takes available space
  },
  shadow: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  leftButton: {
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '400',
  },
  rightButton: {
    width: 60,
    alignItems: 'flex-end',
  },
  rightPlaceholder: {
    width: 60,
  },
  rightLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '400',
  },
});

export default Header;
