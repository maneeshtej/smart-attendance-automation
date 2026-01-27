import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  // Vibration,
} from 'react-native';
import { Colors } from '../../theme/colors';
import PrimaryInput from '../../components/PrimaryInput';
import PrimaryButton from '../../components/PrimaryButton';
import ErrorMessage from '../../components/ErrorMessage'; // Let's use that inline error component
import { useAuth } from '../../hooks/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    // 1. Local Validation
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      // Vibration.vibrate(50); // Haptic feedback for error
      return;
    }

    setErrorMsg(null);
    try {
      await login(email, password);
    } catch (error: any) {
      // Vibration.vibrate(100);
      // 2. Friendly Error Mapping
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('Incorrect email or password.');
      } else if (error.message.includes('network')) {
        setErrorMsg('Network error. Please check your connection.');
      } else {
        setErrorMsg(error.message || 'An unexpected error occurred.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Smart Attendance Automation</Text>
        </View>

        <View style={styles.card}>
          <PrimaryInput
            label="Email"
            value={email}
            onChangeText={text => {
              setEmail(text);
              setErrorMsg(null);
            }}
            placeholder="student@university.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <PrimaryInput
            label="Password"
            value={password}
            onChangeText={text => {
              setPassword(text);
              setErrorMsg(null);
            }}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
          />

          {/* Inline Error is much cleaner than a Modal Alert */}
          <ErrorMessage message={errorMsg} />

          <View style={styles.buttonSpacer}>
            <PrimaryButton
              title={loading ? 'Authenticating...' : 'Login'}
              onPress={handleLogin}
              disabled={loading}
            />
          </View>

          <TouchableOpacity
            style={styles.footer}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
          >
            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.link}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24, // Slightly softer corners
    padding: 24,
    shadowColor: Colors.primary, // Subtle tint in the shadow
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  buttonSpacer: {
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 10, // Larger touch target
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
