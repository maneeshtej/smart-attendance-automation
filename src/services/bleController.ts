import BlePeripheral from 'react-native-ble-peripheral';

export const BleController = {
  startAttendanceBroadcast: async (shortClassId: number) => {
    try {
      await BlePeripheral.stop();
      await new Promise(resolve => setTimeout(resolve, 300));

      // FIX: Ensure this is a String and add the AD prefix
      const broadcastName = `AD${shortClassId}`;

      console.log(`Setting Hardware Name to: ${broadcastName}`);

      // Native call requires a string
      await BlePeripheral.setName(broadcastName);

      await BlePeripheral.addService(
        '12345678-1234-1234-1234-1234567890ab',
        true,
      );
      await BlePeripheral.start();

      console.log('✅ BLE Broadcast started successfully');
    } catch (error) {
      console.error('BLE Broadcast Error:', error);
      throw error; // Re-throw so ScanningPhase can catch it
    }
  },

  stopBroadcast: async () => {
    try {
      await BlePeripheral.stop();
      console.log('🛑 BLE: Broadcast stopped.');
    } catch (error) {
      // If it's already stopped, we don't care about the error
    }
  },
};
