/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Container from '../../../styles/components/Container';
import Header from '../../../styles/components/Header';
import Card from '../../../styles/components/Card';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { styles } from '../../../styles/global/styles';
import { colors } from '../../../styles/theme/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Subtitle from '../../../styles/components/Subtitle';
import { useAuthStore } from '../../../state/auth/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TeacherStackParamList } from '../../../navigation/TeacherStack';
import PrimaryButton from '../../../styles/components/PrimaryButton';
import { useAttendanceStore } from '../../../state/ble/useAttendanceStore';

type TeacherNavProp = NativeStackNavigationProp<
  TeacherStackParamList,
  'TeacherScan'
>;

const TeacherHome = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<TeacherNavProp>();
  const { sessions, deleteSessionById, syncSessionWithRecords } =
    useAttendanceStore();

  return (
    <Container scrollable>
      <Header
        title={`Welcome ${user?.name}`}
        rightLabel="Log out"
        onRightPress={logout}
      />
      <View
        style={[
          styles.standardContainer,
          { paddingTop: 5, paddingHorizontal: 20 },
        ]}
      >
        <Subtitle>Scan</Subtitle>
        <PrimaryButton onPress={() => navigation.navigate('TeacherScan')}>
          Start Scan
        </PrimaryButton>
        <Subtitle>Current Class</Subtitle>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            <View
              style={{
                height: 50,
                width: 50,
                borderRadius: 99,
                backgroundColor: colors.surface,
              }}
            />
            <View
              style={{
                flex: 1,
                height: 30,
                backgroundColor: colors.surface,
                borderRadius: 99,
              }}
            />
          </View>
        </Card>
        <Subtitle>Quick Actions</Subtitle>
        <Card>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <CustomButton label="Scan" color={colors.primary}>
              <Ionicons name="scan" />
            </CustomButton>

            <CustomButton label="Dummy">
              <Ionicons name="scan" />
            </CustomButton>
            <CustomButton label="Dummy">
              <Ionicons name="scan" />
            </CustomButton>
            <CustomButton label="Dummy">
              <Ionicons name="scan" />
            </CustomButton>
          </View>
        </Card>
        <Subtitle>History</Subtitle>
        <Subtitle>Session History</Subtitle>
        <View style={{ flexDirection: 'column', gap: 10 }}>
          {sessions.length === 0 && (
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              No attendance sessions yet.
            </Text>
          )}

          {sessions.map(session => (
            <Card key={session.id} style={{ padding: 12 }}>
              <View style={{ flexDirection: 'column', gap: 4 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.textPrimary,
                  }}
                >
                  {session.subject_name}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  Teacher ID: {session.teacher_id}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  Date:{' '}
                  {new Date(session.created_at || '').toLocaleDateString()}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  Total Present: {session.total_present}
                </Text>

                <View style={{ flexDirection: 'row', marginTop: 6, gap: 8 }}>
                  <PrimaryButton
                    onPress={() => {
                      if (!session?.id) return;
                      // if (session.isSynced) return;
                      syncSessionWithRecords(session.id);
                    }}
                    style={{
                      backgroundColor: colors.primary,
                      paddingVertical: 6,
                      flex: 1,
                    }}
                    textStyle={{ color: '#fff', fontSize: 13 }}
                  >
                    {session.isSynced ? 'Synced' : 'Sync'}
                  </PrimaryButton>

                  <PrimaryButton
                    onPress={() => {
                      if (!session.id) return;
                      deleteSessionById(session.id);
                      console.log('Delete session', session.id);
                    }}
                    style={{
                      backgroundColor: '#E53935',
                      paddingVertical: 6,
                      flex: 1,
                    }}
                    textStyle={{ color: '#fff', fontSize: 13 }}
                  >
                    Delete
                  </PrimaryButton>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </Container>
  );
};

export default TeacherHome;

interface CustomButtonProps {
  children?: React.ReactNode; // Custom layout (icon + text)
  iconName?: string; // Default icon if no children passed
  label?: string; // Text label under the icon
  action?: () => void; // Press handler
}

interface CustomButtonProps {
  icon?: React.ReactNode; // Accepts a full icon component
  label?: string; // Label below the circle
  action?: () => void; // onPress handler
  size?: number; // Circle size (optional)
  color?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  icon,
  label = 'Action',
  action,
  size = 50,
  color = colors.surface,
}) => {
  // Fallback local icon
  const fallbackIcon = (
    <Ionicons name="radio-outline" size={26} color={colors.primary} />
  );

  return (
    <Pressable onPress={action} style={localSstyles.wrapper}>
      {/* Circle */}
      <View
        style={[
          localSstyles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      >
        {icon || fallbackIcon}
      </View>

      {/* Label below */}
      <Text style={localSstyles.label}>{label}</Text>
    </Pressable>
  );
};

const localSstyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '300',
  },
});
