import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

interface HeaderProps {
  title: string;
  showBackButton: boolean;
  onBackButton?: () => void;
  trailing?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton,
  onBackButton,
  trailing,
}) => {
  return (
    <View style={[styles.container]}>
      <Text style={[styles.title]}>{title}</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgb(30,30,30)',
  },
  title: {
    color: 'rgb(250,250,250)',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
