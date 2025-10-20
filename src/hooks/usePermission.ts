import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform, ToastAndroid } from 'react-native';

export interface PermissionState {
  location: boolean;
  bluetoothScan: boolean;
  bluetoothAdvertise: boolean;
  bluetoothConnect: boolean;
}

export const usePermissions = () => {
  const [permissionsGranted, setPermissionGranted] = useState<PermissionState>({
    location: false,
    bluetoothAdvertise: false,
    bluetoothConnect: false,
    bluetoothScan: false,
  });

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

  const requestPermissions = async () => {
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

  useEffect(() => {
    checkPermissions();
  }, []);

  return { permissionsGranted, requestPermissions, checkPermissions };
};
