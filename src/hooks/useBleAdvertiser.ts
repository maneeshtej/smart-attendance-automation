import { useEffect, useState } from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native';

const { BLEAdvertiser } = NativeModules;
const emitter = new NativeEventEmitter(BLEAdvertiser);

type AdvertiserStatus = 'idle' | 'advertising' | 'error';

export function useBleAdvertiser() {
  const [status, setStatus] = useState<AdvertiserStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentName, setCurrentName] = useState<string | null>(null);

  useEffect(() => {
    const successListener = emitter.addListener(
      'AdvertiseStartSuccess',
      data => {
        setStatus('advertising');
        setCurrentName(data?.name ?? null);
        setError(null);
      },
    );

    const failureListener = emitter.addListener(
      'AdvertiseStartFailure',
      data => {
        setStatus('error');
        setError(`Error ${data?.code ?? '?'}: ${data?.message ?? 'Unknown'}`);
      },
    );

    const stopListener = emitter.addListener('AdvertiseStopped', () => {
      setStatus('idle');
      setCurrentName(null);
    });

    return () => {
      successListener.remove();
      failureListener.remove();
      stopListener.remove();
    };
  }, []);

  const startAdvertising = (
    name: string,
    manufacturerId: number,
    payload: number[],
  ) => {
    try {
      BLEAdvertiser.startAdvertising(name, manufacturerId, payload);
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  };

  const stopAdvertising = () => {
    BLEAdvertiser.stopAdvertising();
    setStatus('idle');
  };

  return {
    status,
    error,
    currentName,
    startAdvertising,
    stopAdvertising,
  };
}
