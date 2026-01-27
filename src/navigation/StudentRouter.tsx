import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentHomeScreen from '../screens/student/StudentHomeScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import StudentAttendanceScreen from '../screens/student/StudentAttendanceScreen';

const Stack = createNativeStackNavigator();

export default function StudentRouter() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        // options={{
        //   headerTitle: 'User Profile',
        //   headerShown: true,
        // }}
      />
      <Stack.Screen name="Attendance" component={StudentAttendanceScreen} />
    </Stack.Navigator>
  );
}
