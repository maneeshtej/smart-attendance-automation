import {
  Alert,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

interface PermissionState {
  location: boolean;
  bluetoothScan: boolean;
  bluetoothAdvertise: boolean;
  bluetoothConnect: boolean;
}

const HomeScreen = () => {
  const [permissionsGranted, setPermissionGranted] = useState<PermissionState>({
    location: false,
    bluetoothAdvertise: false,
    bluetoothConnect: false,
    bluetoothScan: false,
  });

  const requirePermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      ]);

      const allGranted = Object.values(granted).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED,
      );

      if (allGranted) {
        ToastAndroid.show('All permissions provided.', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show(
          'Some permissions denied. Try again.',
          ToastAndroid.SHORT,
        );
      }

      // Update state after requesting
      checkPermissions();
    }
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const location = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      const bluetoothAdvertise = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      );
      const bluetoothConnect = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      );
      const bluetoothScan = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      );

      setPermissionGranted({
        location,
        bluetoothAdvertise,
        bluetoothConnect,
        bluetoothScan,
      });
    }
  };

  const startScan = () => {
    console.log('Started scanning...');
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Home Screen" showBackButton={false} />
      <View style={styles.body}>
        <Pressable style={styles.button} onPress={requirePermission}>
          <Text>Get Permissions</Text>
        </Pressable>

        <Text style={styles.text}>
          Location:{' '}
          {permissionsGranted.location ? 'Granted ✅' : 'Not granted ❌'}
        </Text>
        <Text style={styles.text}>
          Bluetooth Scan:{' '}
          {permissionsGranted.bluetoothScan ? 'Granted ✅' : 'Not granted ❌'}
        </Text>
        <Text style={styles.text}>
          Bluetooth Connect:{' '}
          {permissionsGranted.bluetoothConnect
            ? 'Granted ✅'
            : 'Not granted ❌'}
        </Text>
        <Text style={styles.text}>
          Bluetooth Advertise:{' '}
          {permissionsGranted.bluetoothAdvertise
            ? 'Granted ✅'
            : 'Not granted ❌'}
        </Text>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  button: {
    backgroundColor: 'rgb(30,144,255)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  text: {
    color: 'black', // visible on light background
    fontSize: 16,
    marginVertical: 4,
  },
});
