import { Stack, useRouter, useSegments } from 'expo-router';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import { DutyProvider } from '../context/DutyContext';
import { DeliveryProvider } from '../context/DeliveryContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';

LogBox.ignoreLogs(['Unable to activate keep awake']);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

function InitialLayout() {
  const { user, isLoading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0];

    // If on splash screen, let index.tsx handle its timer
    if ((currentSegment as string) === 'index' || !currentSegment) {
      return;
    }

    if (!user && currentSegment !== 'login') {
      router.replace('/login');
    } else if (user && currentSegment === 'login') {
      router.replace('/home');
    }
  }, [user, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="home" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DutyProvider>
            <DeliveryProvider>
              <InitialLayout />
            </DeliveryProvider>
          </DutyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
