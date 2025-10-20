import { bleEmitter } from './BleModule';

type BleEventCallbacks = {
  onStudent?: (id: string) => void;
  onAck?: (msg: string) => void;
  onStatus?: (msg: string) => void;
};

export const listenTeacherEvents = (callbacks: BleEventCallbacks) => {
  const subs = [
    bleEmitter.addListener('studentDetected', (id: string) => {
      callbacks.onStudent?.(id);
    }),
    bleEmitter.addListener('ackSent', (msg: string) => {
      callbacks.onAck?.(msg);
    }),
    bleEmitter.addListener('status', (msg: string) => {
      callbacks.onStatus?.(msg);
    }),
  ];

  return () => subs.forEach(s => s.remove());
};
