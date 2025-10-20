import { NativeModules, NativeEventEmitter } from 'react-native';

// Your Kotlin module name is set by @ReactModule(name = "BLEModule")
const { BLEModule } = NativeModules;

// Event emitter for Kotlin → JS events
export const bleEmitter = new NativeEventEmitter(BLEModule);

// JS wrapper functions for teacher mode
export const startTeacherMode = (subjectId: string) => {
  try {
    BLEModule.startTeacherMode(subjectId);
  } catch (e) {
    console.warn('Failed to start teacher mode', e);
  }
};

export const stopTeacherMode = () => {
  try {
    BLEModule.stopTeacherMode();
  } catch (e) {
    console.warn('Failed to stop teacher mode', e);
  }
};
