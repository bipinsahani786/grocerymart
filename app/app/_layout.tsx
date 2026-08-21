import { Stack, useRouter, useSegments } from 'expo-router';
import { LogBox } from 'react-native';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { SavedItemsProvider } from '../context/SavedItemsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';

LogBox.ignoreLogs(['Unable to activate keep awake']);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache stays fresh for 5 minutes
      gcTime: 1000 * 60 * 30,    // Cache garbage collected after 30 minutes
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

    // If on splash screen, do nothing and let index.tsx handle its timer
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
      <Stack.Screen name="home" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SavedItemsProvider>
          <CartProvider>
            <InitialLayout />
          </CartProvider>
        </SavedItemsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

