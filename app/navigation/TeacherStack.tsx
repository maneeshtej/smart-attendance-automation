import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeacherHome from '../screens/teacher/TeacherHome';
import TeacherScan from '../screens/teacher/TeacherScan';

export type TeacherStackParamList = {
  TeacherHome: undefined;
  TeacherScan: undefined;
  // add other teacher routes here, e.g.
  // TeacherScan: { sessionId?: string } | undefined;
};

const Stack = createNativeStackNavigator<TeacherStackParamList>();

const TeacherStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TeacherHome" component={TeacherHome} />
    <Stack.Screen name="TeacherScan" component={TeacherScan} />
  </Stack.Navigator>
);

export default TeacherStack;
