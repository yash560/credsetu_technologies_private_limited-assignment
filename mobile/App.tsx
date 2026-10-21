import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  const [session, setSession] = useState<{ phone: string; token: string } | null>(null);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={session ? 'dark-content' : 'light-content'} />
      {session ? (
        <HomeScreen
          phone={session.phone}
          onLogout={() => setSession(null)}
        />
      ) : (
        <LoginScreen
          onLoginSuccess={(phone, token) => setSession({ phone, token })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
