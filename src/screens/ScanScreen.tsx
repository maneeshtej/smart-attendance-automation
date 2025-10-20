import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useBleScanner } from '../hooks/useBleScanner';

const ScanScreen = () => {
  const { devices, startScan, stopScan, clearDevices } = useBleScanner();

  const handleStart = () => {
    startScan();
    if (Platform.OS === 'android') {
      ToastAndroid.show('Scanning started', ToastAndroid.SHORT);
    } else {
      console.log('Scanning started');
    }
  };

  const handleStop = () => {
    stopScan();
    if (Platform.OS === 'android') {
      ToastAndroid.show('Scanning stopped', ToastAndroid.SHORT);
    } else {
      console.log('Scanning stopped');
    }
  };

  return (
    <View style={styles.body}>
      <Text style={styles.text}>BLE Scan Screen</Text>

      <View style={{ flexDirection: 'row', marginVertical: 12 }}>
        <Pressable style={styles.button} onPress={handleStart}>
          <Text style={{ color: 'white' }}>Start Scan</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: 'gray' }]}
          onPress={handleStop}
        >
          <Text style={{ color: 'white' }}>Stop Scan</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: 'gray' }]}
          onPress={clearDevices}
        >
          <Text style={{ color: 'white' }}>Clear</Text>
        </Pressable>
      </View>

      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.deviceItem}>
            <Text style={styles.deviceText}>ID: {item.id}</Text>
            <Text style={styles.deviceText}>Name: {item.name}</Text>
            <Text style={styles.deviceText}>RSSI: {item.rssi}</Text>
            <Text style={styles.deviceText}>
              Manufacturer: {JSON.stringify(item.manufacturerData)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: 'white', marginTop: 20 }}>
            No devices found yet.
          </Text>
        }
      />
    </View>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgb(30,30,30)',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'rgb(30,144,255)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  deviceItem: {
    backgroundColor: 'rgb(45,45,45)',
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
  },
  deviceText: {
    color: 'white',
    fontSize: 14,
  },
});
