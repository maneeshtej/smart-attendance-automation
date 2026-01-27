import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../hooks/AuthContext';
import { teacherService } from '../../services/teacherServices';
import { AttendanceSession } from '../../types/attendance';
import { AttendanceSessionCard } from '../../components/cards/AttendenceSessionCard';

const TeacherHomeScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  // State for sessions
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const data = await teacherService.getSessionsByTeacherId(user.id);
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileLink}
            onPress={() =>
              user?.id && navigation.navigate('Profile', { userId: user.id })
            }
          >
            <View>
              <Text style={styles.brandText}>SmartAttendance</Text>
              <Text style={styles.userText}>{user?.name || 'Instructor'}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => navigation.navigate('Attendance')}
        >
          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>Start New Session</Text>
            <Text style={styles.heroSubtitle}>
              Open attendance for your current class
            </Text>
          </View>
          <View style={styles.heroAction}>
            <Text style={styles.heroIcon}>⚡</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.placeholderSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Recent Sessions</Text>
            {isLoading && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
          </View>

          {sessions.length === 0 && !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent sessions found.</Text>
            </View>
          ) : (
            sessions.map(session => (
              <AttendanceSessionCard
                key={session.id}
                session={session}
                displayName={`${session.started_at})}`} // Strict mode: display ID or ref
                onPress={id =>
                  navigation.navigate('SessionDetails', { sessionId: id })
                }
              />
            ))
          )}
        </View>

        <Text style={styles.versionText}>App Version 1.0.0 (BETA)</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
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
    backgroundColor: Colors.primary,
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

export default TeacherHomeScreen;
