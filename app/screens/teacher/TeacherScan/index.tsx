import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Header from '../../../styles/components/Header';
import Container from '../../../styles/components/Container';
import BeforeScan from './module/BeforeScan';
import WhileScanning from './module/WhileScanning';
import AfterScan from './module/AfterScan';

type ScanState = number;

const TeacherScan = () => {
  const [capturedStudents, setCapturedStudents] = useState<string[]>([]);
  const [scanState, setScanState] = useState<ScanState>(0);
  const [subject, setSubject] = useState<string | null>(null);

  const handleChangeState = (next: ScanState) => setScanState(next);

  const handleSuccess = (students: string[]) => {
    setCapturedStudents(students);
    Alert.alert(
      'Submitted',
      `${students.length} students captured:\n${students.join(', ')}`,
    );
    handleChangeState(2); // go to AfterScan
  };

  const renderContent = () => {
    switch (scanState) {
      case 0:
        return (
          <BeforeScan
            handleChangeState={handleChangeState}
            setSubject={setSubject}
          />
        );
      case 1:
        return (
          <WhileScanning
            subjectId={subject || '000'}
            onSuccess={handleSuccess}
            onError={() => handleChangeState(-1)}
          />
        );
      case 2:
        return (
          <AfterScan
            students={capturedStudents}
            subject={subject}
            onReset={() => handleChangeState(0)}
          />
        );
      default:
        return null;
    }
  };

  useEffect(
    () => console.log('Captured:', capturedStudents),
    [capturedStudents],
  );

  return (
    <Container>
      <Header title="Teacher Scan" />
      <View style={styles.body}>{renderContent()}</View>
    </Container>
  );
};

export default TeacherScan;

const styles = StyleSheet.create({
  body: { flex: 1 },
});
