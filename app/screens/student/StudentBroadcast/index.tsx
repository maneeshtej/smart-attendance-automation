import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../../../styles/components/Header';
import Container from '../../../styles/components/Container';
import BeforeScan from './module/BeforeScan';
import WhileScanning from './module/WhileScanning';
import AfterScan from './module/AfterScan';
import ErrorScreen from './module/ErrorScreen';

type ScanState = number;

const StudentBroadcast = () => {
  const [subject, setSubject] = useState<string>('');
  const [scanState, setScanState] = useState<ScanState>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChangeState = (next: ScanState) => setScanState(next);

  const handleSuccess = (sub: string) => {
    setSubject(sub);
    handleChangeState(2);
  };

  const handleError = (msg?: string) => {
    setErrorMsg(msg || 'A BLE error occurred during broadcast.');
    handleChangeState(-1);
  };

  const renderContent = () => {
    switch (scanState) {
      case 0:
        return <BeforeScan handleChangeState={handleChangeState} />;
      case 1:
        return (
          <WhileScanning onSuccess={handleSuccess} onError={handleError} />
        );
      case 2:
        return (
          <AfterScan subject={subject} onReset={() => handleChangeState(0)} />
        );
      case -1:
        return (
          <ErrorScreen
            message={errorMsg || undefined}
            onRetry={() => {
              setErrorMsg(null);
              handleChangeState(0);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <Header title="Attend" />
      <View style={styles.body}>{renderContent()}</View>
    </Container>
  );
};

export default StudentBroadcast;

const styles = StyleSheet.create({
  body: { flex: 1 },
});
