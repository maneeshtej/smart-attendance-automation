import BlePeripheral from 'react-native-ble-peripheral';

// Use a consistent UUID across Teacher/Student apps
const SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab';

export const BleController = {
  startAttendanceBroadcast: async (key: string) => {
    try {
      // 1. Set the Name to the Short ID (This is what students scan for)
      await BlePeripheral.setName(key);

      // 2. Add the Service
      // The second parameter 'true' makes it primary
      await BlePeripheral.addService(SERVICE_UUID, true);

      // 3. Start Advertising
      await BlePeripheral.start();
      console.log(`📡 BLE: Advertising Class ${key} for 10s...`);

      // 4. Auto-stop after 10 seconds to save battery/close window
      setTimeout(async () => {
        await BleController.stopBroadcast();
      }, 10000);
    } catch (error) {
      console.error('BLE Broadcast Error:', error);
    }
  },

  stopBroadcast: async () => {
    try {
      await BlePeripheral.stop();
      console.log('🛑 BLE: Broadcast stopped.');
    } catch (error) {
      console.error('BLE Stop Error:', error);
    }
  },
};
