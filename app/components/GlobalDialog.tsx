import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors } from '../styles/theme/colors';

// Global references (for triggering from anywhere)
let globalShow: (text: string, title?: string) => void;
let globalHide: () => void;

/**
 * Call this from anywhere:
 *   showModal("Invalid credentials");
 *   showModal("Session expired", "Authentication Error");
 */
export const showModal = (message: string, title?: string) =>
  globalShow?.(message, title);

export const hideModal = () => globalHide?.();

export const GlobalModalHost = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    globalShow = (msg, ttl) => {
      setMessage(msg);
      setTitle(ttl || '');
      setVisible(true);
    };
    globalHide = () => {
      setVisible(false);
      setMessage('');
      setTitle('');
    };
  }, []);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={hideModal}
        />
        <View style={styles.container}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.okButton} onPress={hideModal}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: '80%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  okButton: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  okButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
