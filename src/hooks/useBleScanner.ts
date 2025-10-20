import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';

const { MyBleModule } = NativeModules;
const emitter = new NativeEventEmitter(MyBleModule);

export function useBleScanner() {
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    const listener = emitter.addListener('BleDeviceFound', device => {
      const name = device?.name ?? 'Unknown';

      // Log every advertisement
      console.log(
        '[BLE] Device:',
        name,
        'ID:',
        device.id,
        'Manufacturer:',
        device.manufacturerData,
      );

      // Keep one entry per ID
      setDevices(prev => {
        if (!prev.find(d => d.id === device.id)) {
          return [...prev, device];
        }
        return prev;
      });
    });

    return () => listener.remove();
  }, []);

  const startScan = () => {
    console.log('[BLE] Starting scan...');
    MyBleModule.startScan();
  };

  const stopScan = () => {
    console.log('[BLE] Stopping scan...');
    MyBleModule.stopScan();
  };

  const clearDevices = () => {
    console.log('[BLE] Clearing device list...');
    setDevices([]);
  };

  return { devices, startScan, stopScan, clearDevices };
}
