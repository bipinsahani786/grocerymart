import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { DutyProvider } from '../context/DutyContext';
import { DeliveryProvider } from '../context/DeliveryContext';
import { LanguageProvider } from '../context/LanguageContext';
import { SettingsProvider } from '../context/SettingsContext';
import { SettingsToast } from '../components/common/SettingsToast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

LogBox.ignoreLogs([
  'Unable to activate keep awake',
  'tracking-X relative letter spacing classes require font-size to be set',
]);


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

function InitialLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <SettingsToast />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="home" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DutyProvider>
            <DeliveryProvider>
              <LanguageProvider>
                <SettingsProvider>
                  <InitialLayout />
                </SettingsProvider>
              </LanguageProvider>
            </DeliveryProvider>
          </DutyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
