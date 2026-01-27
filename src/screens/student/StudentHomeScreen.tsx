import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../hooks/AuthContext';

const StudentHomeScreen = ({ navigation }: any) => {
  // Hooks at the very top
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  // Safety check
  if (!user) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileLink}
            onPress={() => {
              if (user?.id) {
                navigation.navigate('Profile', { userId: user.id });
              }
            }}
          >
            <View>
              <Text style={styles.brandText}>SmartAttendance</Text>
              <Text style={styles.userText}>{user?.name || 'Instructor'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={logout}
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* PRIMARY HERO CARD - USES FOREST GREEN */}
        <TouchableOpacity
          style={styles.heroCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Attendance')}
        >
          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>Join Session</Text>
            <Text style={styles.heroSubtitle}>
              Enter code to mark your attendance
            </Text>
          </View>
          <View style={styles.heroAction}>
            <Text style={styles.heroIcon}>📍</Text>
          </View>
        </TouchableOpacity>

        {/* PLACEHOLDERS */}
        <View style={styles.placeholderSection}>
          <Text style={styles.sectionLabel}>Your Overview</Text>

          {[1, 2].map(item => (
            <View key={item} style={styles.skeletonCard}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonTextContainer}>
                <View
                  style={[
                    styles.skeletonLine,
                    { width: item === 1 ? '70%' : '55%' },
                  ]}
                />
                <View
                  style={[styles.skeletonLine, { width: '40%', height: 8 }]}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.versionText}>Student Portal v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  userText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
  },
  heroCard: {
    backgroundColor: Colors.primary, // Forest Green preserved here
    borderRadius: 28,
    padding: 28,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  heroInfo: {
    flex: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 14,
    fontWeight: '500',
  },
  heroAction: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  heroIcon: {
    fontSize: 24,
  },
  placeholderSection: {
    marginTop: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 20,
    marginLeft: 4,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    opacity: 0.4,
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  skeletonTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 20,
    letterSpacing: 0.5,
  },
});

export default StudentHomeScreen;
