import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import TeacherStack from './TeacherStack';
import StudentStack from './StudentStack';
import { useAuthStore } from '../state/auth/useAuthStore';

const AppNavigator = () => {
  const { user } = useAuthStore();

  useEffect(() => console.log(user ? user : 'no uswer'), [user]);

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user.role === 'teacher' ? (
        <TeacherStack />
      ) : (
        <StudentStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
