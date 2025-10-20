import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ViewStyle,
  TextStyle,
  LayoutRectangle,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../theme/colors';

export interface Option {
  subject: string;
  code: string;
}

interface PrimaryDropdownProps {
  options: Option[];
  selected?: string;
  onSelect?: (option: Option) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Dropdown: React.FC<PrimaryDropdownProps> = ({
  options,
  selected,
  onSelect,
  style,
  textStyle,
}) => {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutRectangle | null>(null);
  const selectedOption = options.find(opt => opt.code === selected);

  return (
    <View
      style={[MyStyles.container, style]}
      onLayout={e => setLayout(e.nativeEvent.layout)}
    >
      {/* Main selector */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(!open)}
        style={MyStyles.selector}
      >
        <Text style={[MyStyles.text, textStyle]}>
          {selectedOption ? selectedOption.subject : 'Select Subject'}
        </Text>
      </TouchableOpacity>

      {/* Floating dropdown using modal overlay */}
      <Modal visible={open} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={MyStyles.overlay}>
            {layout && (
              <View
                style={[
                  MyStyles.dropdown,
                  {
                    top: layout.y + layout.height,
                    left: layout.x,
                    width: layout.width,
                  },
                ]}
              >
                <FlatList
                  data={options}
                  keyExtractor={item => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={MyStyles.option}
                      onPress={() => {
                        setOpen(false);
                        onSelect?.(item);
                      }}
                    >
                      <Text style={MyStyles.optionText}>{item.subject}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const MyStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  selector: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default Dropdown;
