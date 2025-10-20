// app/components/Container.tsx
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { colors } from '../theme/colors';

interface ContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  center?: boolean;
  scrollable?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  style,
  backgroundColor = colors.background,
  center = false,
  scrollable = false,
  ...scrollProps
}) => {
  // Build styles safely
  const containerStyle: ViewStyle = {
    ...styles.container,
    backgroundColor,
    ...(center ? { justifyContent: 'center', alignItems: 'center' } : {}),
    ...(style || {}),
  };

  if (scrollable) {
    return (
      <ScrollView
        style={{ backgroundColor }}
        contentContainerStyle={containerStyle}
        {...scrollProps}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    position: 'relative',
  },
});

export default Container;
