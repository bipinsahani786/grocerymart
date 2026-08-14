import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileView } from '../components/ProfileView';
import { CustomCurvedNavBar, TabKey } from '../components/CustomCurvedNavBar';
import { theme } from '../constants/theme';
import tw from 'twrnc';

/**
 * Single Responsibility: Dedicated route for /profile, reusing ProfileView and persistent navbar.
 */
export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleTabPress = (tab: TabKey) => {
    if (tab === 'home' || tab === 'search' || tab === 'cart') {
      router.replace('/home');
    }
  };

  return (
    <SafeAreaProvider>
      <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
        <ProfileView onBack={() => router.replace('/home')} />
        <CustomCurvedNavBar activeTab="profile" onTabPress={handleTabPress} />
      </View>
    </SafeAreaProvider>
  );
}
