import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/AuthContext';
import { Colors } from '../theme/colors';

// Import your sub-routers
import AuthRouter from './AuthRouter';
import TeacherRouter from './TeacherRouter';
import StudentRouter from './StudentRouter';

export default function Router() {
  const { user, session, loading } = useAuth();

  // 1. Show a professional splash/loading state while session is being verified
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* 2. Determine which world the user lives in */}
      {!session || !user ? (
        <AuthRouter />
      ) : user.role === 'teacher' ? (
        <TeacherRouter />
      ) : (
        <StudentRouter />
      )}
    </NavigationContainer>
  );
}
