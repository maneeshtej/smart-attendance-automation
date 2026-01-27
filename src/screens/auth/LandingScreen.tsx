import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../theme/colors';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/AuthContext';

export default function LandingScreen({ navigation }: any) {
  const { session, loading } = useAuth();

  useEffect(() => {
    // If loading is finished and we have a session,
    // automatically jump to the main app screen
    if (!loading && session) {
      navigation.replace('Home'); // Use replace so they can't "Go Back" to Landing
    }
  }, [session, loading, navigation]);

  // Show a spinner while checking the session
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Attendance</Text>
      <Text style={styles.subtitle}>Automate your classroom tracking</Text>

      <PrimaryButton
        title="Get Started"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
