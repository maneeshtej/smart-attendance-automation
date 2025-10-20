import { PermissionsAndroid, Platform, ToastAndroid } from 'react-native';

export async function requestBluetoothPermission() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    const allGranted = Object.values(granted).every(
      status => status === PermissionsAndroid.RESULTS.GRANTED,
    );

    return allGranted;
  }
  return true;
}

export async function requestLocationPermission() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

export async function ensureAllPermissions() {
  if (Platform.OS === 'android') {
    const bluetoothGranted = await requestBluetoothPermission();
    const locationGranted = await requestLocationPermission();

    const allGranted = bluetoothGranted && locationGranted;

    if (allGranted) {
      ToastAndroid.show(
        'All permissions granted successfully',
        ToastAndroid.SHORT,
      );
    } else {
      ToastAndroid.show('Some permissions were not granted', ToastAndroid.LONG);
      console.warn('Required permissions were not granted');
    }

    return allGranted;
  }

  return true;
}
