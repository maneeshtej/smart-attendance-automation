import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Services & Types
import * as authService from '../../services/authService';
import { UserData, BaseUser } from '../../types/user';
import { teacherService } from '../../services/teacherServices';
import { studentService } from '../../services/studentServices';
import { Colors } from '../../theme/colors'; 
import { BaseSubject } from '../../types/subject';
import { BaseClass } from '../../types/class';

// Atomic Components
import { UserCard } from '../../components/cards/UserCard';
import { ClassCard } from '../../components/cards/ClassCard';
import { SubjectCard } from '../../components/cards/SubjectCard';

const TEACHER_TABS = ['Students', 'Subjects', 'Classes'] as const;
const STUDENT_TABS = ['Subjects', 'Classes'] as const;

export default function ProfileScreen() {
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { userId } = route.params || {};

  // --- Core State ---
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Lazy Data Lists ---
  const [students, setStudents] = useState<BaseUser[] | null>(null);
  const [subjects, setSubjects] = useState<BaseSubject[] | null>(null);
  const [classes, setClasses] = useState<BaseClass[] | null>(null);

  // --- UI State ---
  const [isFetchingLazy, setIsFetchingLazy] = useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

  // --- Helpers ---
  const isTeacher = user?.role === 'teacher';
  const currentTabs = isTeacher ? TEACHER_TABS : STUDENT_TABS;
  const activeTabName = currentTabs[selectedTabIndex];

  const isDataEmpty =
    (activeTabName === 'Students' && students?.length === 0) ||
    (activeTabName === 'Subjects' && subjects?.length === 0) ||
    (activeTabName === 'Classes' && classes?.length === 0);

  // 1. Logic: Fetch data based on Tab Name (Role-Proof)
  const fetchLazyData = async (index: number) => {
    const tabName = isTeacher ? TEACHER_TABS[index] : STUDENT_TABS[index];

    // Industrial Caching
    if (tabName === 'Students' && students) return;
    if (tabName === 'Subjects' && subjects) return;
    if (tabName === 'Classes' && classes) return;

    setIsFetchingLazy(true);
    try {
      if (isTeacher) {
        if (tabName === 'Students')
          setStudents(await teacherService.getEnrolledStudents(userId));
        if (tabName === 'Subjects')
          setSubjects(await teacherService.getTeacherSubjects(userId));
        if (tabName === 'Classes')
          setClasses(await teacherService.getTeacherClasses(userId));
      } else {
        if (tabName === 'Subjects')
          setSubjects(await studentService.getStudentSubjects(userId));
        if (tabName === 'Classes')
          setClasses(await studentService.getStudentClasses(userId));
      }
    } catch (error: any) {
      console.error(`❌ Fetch failed for ${tabName}:`, error.message);
    } finally {
      setIsFetchingLazy(false);
    }
  };

  // 2. Effect: Load Profile on Mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        if (userId) {
          const profile = await authService.getUserProfile(userId);
          setUser(profile);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId]);

  // 3. Effect: Auto-load first tab once user role is known
  useEffect(() => {
    if (user) {
      fetchLazyData(0);
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER SECTION */}
      <View style={styles.headerSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)}</Text>
        </View>
        <Text style={styles.nameText}>{user?.name}</Text>
        <Text style={styles.roleBadge}>{user?.role?.toUpperCase()}</Text>
        <View style={styles.contactRow}>
          <Text style={styles.emailText}>{user?.email}</Text>
          {user?.phone_no && (
            <>
              <Text style={styles.dot}> • </Text>
              <Text style={styles.emailText}>{user?.phone_no}</Text>
            </>
          )}
        </View>
      </View>

      {/* BOTTOM SECTION: LISTS */}
      <View style={styles.bottomSection}>
        {/* TABS */}
        <View style={styles.tabRow}>
          {currentTabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                selectedTabIndex === index && styles.activeTab,
              ]}
              onPress={() => {
                setSelectedTabIndex(index);
                fetchLazyData(index);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTabIndex === index && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LIST VIEW */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isFetchingLazy ? (
            <ActivityIndicator
              size="small"
              color={Colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : (
            <View style={styles.listContainer}>
              {/* Conditional Rendering by TAB NAME */}
              {activeTabName === 'Students' &&
                students?.map(s => <UserCard key={s.id} user={s} />)}

              {activeTabName === 'Subjects' &&
                subjects?.map(sub => <SubjectCard key={sub.id} item={sub} />)}

              {activeTabName === 'Classes' &&
                classes?.map(c => <ClassCard key={c.id} item={c} />)}

              {/* Empty State */}
              {!isFetchingLazy && isDataEmpty && (
                <Text style={styles.emptyText}>
                  No {activeTabName.toLowerCase()} found.
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSection: {
    height: '35%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 1,
  },
  contactRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  emailText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  dot: { color: 'rgba(255,255,255,0.5)', marginHorizontal: 4 },
  bottomSection: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  activeTabText: { color: Colors.primary },
  scrollContent: { paddingHorizontal: 25, paddingVertical: 20 },
  listContainer: { paddingBottom: 40 },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 14,
  },
});
