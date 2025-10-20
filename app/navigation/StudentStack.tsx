import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentHome from '../screens/student/StudentHome';
import StudentBroadcast from '../screens/student/StudentBroadcast';

export type StudentStackParamList = {
  StudentHome: undefined;
  StudentBroadcast: undefined;
  // TeacherScan: undefined;
  // add other teacher routes here, e.g.
  // TeacherScan: { sessionId?: string } | undefined;
};

const Stack = createNativeStackNavigator<StudentStackParamList>();

const StudentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentHome" component={StudentHome} />
    <Stack.Screen name="StudentBroadcast" component={StudentBroadcast} />
  </Stack.Navigator>
);

export default StudentStack;
