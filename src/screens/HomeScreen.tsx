import { StyleSheet, View } from 'react-native';
import React from 'react';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      {/* <Header title="Home Screen" showBackButton={false} />
      <View style={styles.body}>
        <Pressable
          style={styles.button}
          onPress={() => {
            naviagate.navigate('PermissionScreen');
          }}
        >
          <Text>Scan</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            naviagate.navigate('AdvertiseScreen');
          }}
        >
          <Text>Advertise</Text>
        </Pressable>
      </View> */}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(30,30,30)',
  },
  button: {
    backgroundColor: 'rgb(30,144,255)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    color: 'white',
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginVertical: 4,
  },
});
