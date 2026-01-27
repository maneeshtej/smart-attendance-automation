import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeacherHomeScreen from '../screens/teacher/TeacherHomeScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import AttendanceGate from '../screens/teacher/AttendanceGate';
import ScanningPhase from '../screens/teacher/ScanningPhase';

const Stack = createNativeStackNavigator();

export default function TeacherRouter() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        // options={{
        //   headerTitle: 'User Profile',
        //   headerShown: true,
        // }}
      />
      <Stack.Screen name="Attendance" component={AttendanceGate} />
      <Stack.Screen name="ScanningPhase" component={ScanningPhase} />
    </Stack.Navigator>
  );
}
