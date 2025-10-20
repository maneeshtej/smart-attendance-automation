import React from 'react';
import { View } from 'react-native';
import { styles } from '../../../../styles/global/styles';
import Subtitle from '../../../../styles/components/Subtitle';
import PrimaryButton from '../../../../styles/components/PrimaryButton';
import { ensureAllPermissions } from '../../../../helpers/permissions/permissionsManager';

const BeforeScan = ({
  handleChangeState,
}: {
  handleChangeState: (s: number) => void;
}) => {
  return (
    <View style={[styles.standardContainer]}>
      <Subtitle>Permission</Subtitle>
      <PrimaryButton onPress={() => ensureAllPermissions()}>
        Get Permissions
      </PrimaryButton>
      <Subtitle>Attend</Subtitle>
      <PrimaryButton onPress={() => handleChangeState(1)}>
        Start Attend
      </PrimaryButton>
    </View>
  );
};

export default BeforeScan;
