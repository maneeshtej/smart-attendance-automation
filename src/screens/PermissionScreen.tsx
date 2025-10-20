import React, { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { usePermissions } from '../hooks/usePermission';

const PermissionsScreen = () => {
  const navigation = useNavigation<any>();
  const { permissionsGranted, requestPermissions } = usePermissions();

  // Check if all permissions are granted
  const allGranted = Object.values(permissionsGranted).every(Boolean);

  useEffect(() => {
    if (allGranted) {
      // Navigate to the next screen after a short delay
      const timeout = setTimeout(() => {
        navigation.replace('ScanScreen'); // Replace with your next screen name
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [allGranted]);

  return (
    <View style={styles.container}>
      <Header title="Permissions Check" showBackButton={false} />
      <View style={styles.body}>
        {allGranted ? (
          <>
            <Text style={styles.text}>All permissions granted! ✅</Text>
            <ActivityIndicator size="large" color="white" />
          </>
        ) : (
          <>
            <Text style={styles.text}>
              Please grant all permissions to proceed.
            </Text>
            <Pressable style={styles.button} onPress={requestPermissions}>
              <Text style={styles.buttonText}>Request Permissions</Text>
            </Pressable>
            <Text style={styles.text}>
              Location: {permissionsGranted.location ? '✅' : '❌'}
            </Text>
            <Text style={styles.text}>
              Bluetooth Scan: {permissionsGranted.bluetoothScan ? '✅' : '❌'}
            </Text>
            <Text style={styles.text}>
              Bluetooth Connect:{' '}
              {permissionsGranted.bluetoothConnect ? '✅' : '❌'}
            </Text>
            <Text style={styles.text}>
              Bluetooth Advertise:{' '}
              {permissionsGranted.bluetoothAdvertise ? '✅' : '❌'}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

export default PermissionsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(30,30,30)',
    padding: 16,
  },
  button: {
    backgroundColor: 'rgb(30,144,255)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginVertical: 4,
  },
});
