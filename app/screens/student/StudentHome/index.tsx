/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import Container from '../../../styles/components/Container';
import Header from '../../../styles/components/Header';
import Card from '../../../styles/components/Card';
import { styles } from '../../../styles/global/styles';
import { colors } from '../../../styles/theme/colors';
import Subtitle from '../../../styles/components/Subtitle';
import { useAuthStore } from '../../../state/auth/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PrimaryButton from '../../../styles/components/PrimaryButton';
import { Text, View } from 'react-native';
import { StudentStackParamList } from '../../../navigation/StudentStack';
import { supabase } from '../../../services/supabase/supabase';

type StudentNavProp = NativeStackNavigationProp<
  StudentStackParamList,
  'StudentBroadcast'
>;

const StudentHome = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation<StudentNavProp>();
  const [records, setRecords] = useState<any[]>();

  const fetchSessionsByDeviceId = async (deviceId: string) => {
    try {
      const { data, error } = await supabase
        .schema('test')
        .from('attendance_sessions')
        .select(
          `
        id,
        teacher_id,
        subject_name,
        total_present,
        created_at,
        attendance_records (
          id,
          device_id,
          confirmed_at
        )
      `,
        )
        .eq('attendance_records.device_id', deviceId);

      if (error) throw error;
      console.log('✅ Found sessions:', data);
      setRecords(data);
    } catch (err) {
      console.error('❌ fetchSessionsByDeviceId failed:', err);
      return setRecords([]);
    }
  };

  useEffect(() => {
    if (user?.deviceId) fetchSessionsByDeviceId(user?.deviceId);
  }, []);

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
        <Subtitle>Participate</Subtitle>
        <PrimaryButton onPress={() => navigation.navigate('StudentBroadcast')}>
          Attend
        </PrimaryButton>
        <PrimaryButton
          onPress={async () => {
            if (user?.deviceId) await fetchSessionsByDeviceId(user?.deviceId);
          }}
        >
          Fetch
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

        <Subtitle>History</Subtitle>
        <View style={{ flexDirection: 'column', gap: 15 }}>
          {records !== undefined && records.length === 0 ? (
            <Card>
              <View style={{ padding: 12 }}>
                <Subtitle>No attendance sessions yet</Subtitle>
              </View>
            </Card>
          ) : (
            records &&
            records.map(session => (
              <Card key={session.id} style={{ padding: 12 }}>
                <View style={{ flexDirection: 'column', gap: 4 }}>
                  <Subtitle>
                    {session.subject_name || 'Unnamed Subject'}
                  </Subtitle>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    Teacher ID: {session.teacher_id}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    Date: {new Date(session.created_at).toLocaleString()}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    Total Present: {session.total_present}
                  </Text>

                  {/* If session contains this student's record */}
                  {session.attendance_records?.length > 0 && (
                    <View style={{ marginTop: 6 }}>
                      <Text
                        style={{
                          color: colors.success || '#4CAF50',
                          fontSize: 14,
                          fontWeight: '600',
                        }}
                      >
                        ✅ Marked Present
                      </Text>
                      <Text style={{ color: '#777', fontSize: 12 }}>
                        Confirmed at:{' '}
                        {new Date(
                          session.attendance_records[0].confirmed_at,
                        ).toLocaleTimeString()}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            ))
          )}
        </View>
      </View>
    </Container>
  );
};

export default StudentHome;

// interface CustomButtonProps {
//   children?: React.ReactNode; // Custom layout (icon + text)
//   iconName?: string; // Default icon if no children passed
//   label?: string; // Text label under the icon
//   action?: () => void; // Press handler
// }

// interface CustomButtonProps {
//   icon?: React.ReactNode; // Accepts a full icon component
//   label?: string; // Label below the circle
//   action?: () => void; // onPress handler
//   size?: number; // Circle size (optional)
//   color?: string;
// }

// const CustomButton: React.FC<CustomButtonProps> = ({
//   icon,
//   label = 'Action',
//   action,
//   size = 50,
//   color = colors.surface,
// }) => {
//   // Fallback local icon
//   const fallbackIcon = (
//     <Ionicons name="radio-outline" size={26} color={colors.primary} />
//   );

//   return (
//     <Pressable onPress={action} style={localSstyles.wrapper}>
//       {/* Circle */}
//       <View
//         style={[
//           localSstyles.circle,
//           {
//             width: size,
//             height: size,
//             borderRadius: size / 2,
//             backgroundColor: color,
//           },
//         ]}
//       >
//         {icon || fallbackIcon}
//       </View>

//       {/* Label below */}
//       <Text style={localSstyles.label}>{label}</Text>
//     </Pressable>
//   );
// };

// const localSstyles = StyleSheet.create({
//   wrapper: {
//     alignItems: 'center',
//   },
//   circle: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: colors.shadow,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   label: {
//     color: colors.textPrimary,
//     fontSize: 11,
//     marginTop: 8,
//     textAlign: 'center',
//     fontWeight: '300',
//   },
// });
