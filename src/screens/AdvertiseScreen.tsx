import React, { useState, useEffect } from 'react';
import { Button, Text, TextInput, View, ToastAndroid } from 'react-native';
import { useBleAdvertiser } from '../hooks/useBleAdvertiser';

export default function AdvertiseScreen() {
  const { status, currentName, startAdvertising, stopAdvertising } =
    useBleAdvertiser();

  const [name, setName] = useState('FRUZ6T1XCNBPG9M');
  const [payloadInput, setPayloadInput] = useState('DE,AD,BE,EF');
  const [manufacturerId, setManufacturerId] = useState('1234');

  // Log and toast whenever advertising status changes
  useEffect(() => {
    console.log(`[BLE] Status changed → ${status}`);
    if (status === 'advertising') {
      ToastAndroid.show(`Advertising as ${currentName}`, ToastAndroid.SHORT);
    } else if (status === 'error') {
      ToastAndroid.show('Advertising failed', ToastAndroid.SHORT);
    } else if (status === 'idle') {
      ToastAndroid.show('Advertising stopped', ToastAndroid.SHORT);
    }
  }, [status]);

  const parsePayload = (input: string): number[] => {
    return input
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)
      .map(v => {
        if (v.startsWith('0x')) return parseInt(v, 16);
        if (/^[0-9A-Fa-f]+$/.test(v)) return parseInt(v, 16);
        return parseInt(v, 10);
      })
      .filter(n => !isNaN(n) && n >= 0 && n <= 255);
  };

  const handleStart = () => {
    const payloadArray = parsePayload(payloadInput);
    const companyId = parseInt(manufacturerId, 16) || 0x1234;

    console.log('[BLE] Starting advertisement...');
    console.log('  Name:', name);
    console.log('  Manufacturer ID:', companyId.toString(16));
    console.log('  Payload:', payloadArray);

    ToastAndroid.show('Starting advertising...', ToastAndroid.SHORT);
    startAdvertising(name, companyId, payloadArray);
  };

  const handleStop = () => {
    console.log('[BLE] Stopping advertisement...');
    ToastAndroid.show('Stopping advertising...', ToastAndroid.SHORT);
    stopAdvertising();
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: 'white' }}>
        BLE Advertiser
      </Text>
      <Text style={{ color: 'white' }}>Status: {status}</Text>
      <Text style={{ color: 'white' }}>
        Advertising Name: {currentName ?? '-'}
      </Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter BLE name (e.g. FRUZ6T1XCNBPG9M)"
        placeholderTextColor="#888"
        style={{
          borderWidth: 1,
          borderColor: '#999',
          borderRadius: 8,
          padding: 10,
          width: '100%',
          color: 'white',
        }}
      />

      <TextInput
        value={manufacturerId}
        onChangeText={setManufacturerId}
        placeholder="Manufacturer ID (hex, e.g. 1234)"
        placeholderTextColor="#888"
        style={{
          borderWidth: 1,
          borderColor: '#999',
          borderRadius: 8,
          padding: 10,
          width: '100%',
          color: 'white',
        }}
      />

      <TextInput
        value={payloadInput}
        onChangeText={setPayloadInput}
        placeholder="Payload bytes (comma-separated, e.g. DE,AD,BE,EF)"
        placeholderTextColor="#888"
        style={{
          borderWidth: 1,
          borderColor: '#999',
          borderRadius: 8,
          padding: 10,
          width: '100%',
          color: 'white',
        }}
      />

      <Button title="Start Advertising" onPress={handleStart} />
      <Button title="Stop Advertising" onPress={handleStop} />
    </View>
  );
}
