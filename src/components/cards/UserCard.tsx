import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BaseUser } from '../../types/user';
import { Colors } from '../../theme/colors';

interface UserCardProps {
  user: BaseUser;
}

export const UserCard = ({ user }: UserCardProps) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.push('Profile', { userId: user.id })}
      activeOpacity={0.7}
    >
      {/* AVATAR SECTION */}
      <View style={styles.avatarContainer}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>
              {user.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* INFO SECTION */}
      <View style={styles.textContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {user.name}
        </Text>
        {user.role && (
          <Text style={styles.roleText}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Text>
        )}
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
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  initialsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '15', // Subtle primary tint
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  roleText: {
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
