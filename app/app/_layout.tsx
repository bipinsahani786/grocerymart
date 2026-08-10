import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import { AuthProvider } from '../context/AuthContext';

LogBox.ignoreLogs(['Unable to activate keep awake']);

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
