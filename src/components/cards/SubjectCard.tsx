import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { BaseSubject } from '../../types/subject';

interface SubjectCardProps {
  item: BaseSubject;
}

export const SubjectCard = ({ item }: SubjectCardProps) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => console.log('Navigate to Subject:', item.id)}
      activeOpacity={0.7}
    >
      {/* ICON SECTION */}
      <View style={styles.iconContainer}>
        <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
          <Text style={styles.iconText}>📚</Text>
        </View>
      </View>

      {/* INFO SECTION */}
      <View style={styles.textContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.subText}>Code: {item.code}</Text>
      </View>

      {/* ACTION INDICATOR */}
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12, // Slightly more squared than avatars for distinction
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  subText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: '#D1D5DB',
    fontWeight: '300',
    marginLeft: 8,
  },
});
