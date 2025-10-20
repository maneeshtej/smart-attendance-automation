import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { styles } from '../../../../styles/global/styles';
import Subtitle from '../../../../styles/components/Subtitle';
import PrimaryButton from '../../../../styles/components/PrimaryButton';
import Dropdown, { Option } from '../../../../styles/components/DropDown';
import { ensureAllPermissions } from '../../../../helpers/permissions/permissionsManager';
import { SubjectMap } from '../../../../config/SubjectMap';
import { useAuthStore } from '../../../../state/auth/useAuthStore';
import { useAttendanceStore } from '../../../../state/ble/useAttendanceStore';
import Card from '../../../../styles/components/Card';
import { colors } from '../../../../styles/theme/colors';

const BeforeScan = ({
  handleChangeState,
  setSubject,
}: {
  handleChangeState: (s: number) => void;
  setSubject: (subject: string) => void;
}) => {
  const [option, setOption] = useState<Option>();
  const { user, logout } = useAuthStore();
  const { startSessionLocal, currentSession, deleteCurrentSession } =
    useAttendanceStore();

  const handleDeleteSession = () => {
    Alert.alert(
      'Delete Current Session',
      'Are you sure you want to clear the current session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCurrentSession(),
        },
      ],
    );
  };

  return (
    <View style={[styles.standardContainer]}>
      <Subtitle>Enter class</Subtitle>
      <Dropdown
        options={SubjectMap}
        selected={option?.code}
        onSelect={val => {
          setOption(val);
          setSubject(val.code); // Save selected subject code
        }}
      />
      <Subtitle>Permission</Subtitle>
      <PrimaryButton onPress={() => ensureAllPermissions()}>
        Get Permissions
      </PrimaryButton>
      <Subtitle>Session</Subtitle>
      {currentSession && (
        <Card style={{ marginBottom: 15 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 4,
              color: colors.textPrimary,
            }}
          >
            Current Session
          </Text>
          <Text style={[{ color: colors.textPrimary }]}>
            Subject: {currentSession.subject_name}
          </Text>
          <Text style={[{ color: colors.textPrimary }]}>
            Created:{' '}
            {new Date(currentSession.created_at || '').toLocaleString()}
          </Text>

          <PrimaryButton
            onPress={handleDeleteSession}
            style={{
              backgroundColor: '#E53935',
              marginTop: 8,
              paddingVertical: 8,
            }}
            textStyle={{ color: '#fff', fontSize: 13 }}
          >
            Delete Session
          </PrimaryButton>
        </Card>
      )}
      <PrimaryButton
        onPress={() => {
          if (!user || !user.id) {
            logout();
            return;
          }
          if (!option?.subject) return;
          startSessionLocal(user?.id, option?.subject);
        }}
      >
        Create Session
      </PrimaryButton>

      <Subtitle>Scan</Subtitle>
      <PrimaryButton
        onPress={() => {
          if (!user || !user.id) {
            logout();
            return;
          }
          if (!option?.subject) return;
          handleChangeState(1);
        }}
      >
        Start Scan
      </PrimaryButton>
    </View>
  );
};

export default BeforeScan;
