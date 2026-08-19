import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from './profile/ProfileHeader';
import { ProfileVipCard } from './profile/ProfileVipCard';
import { ProfileWalletHub } from './profile/ProfileWalletHub';
import { ProfileActivityGrid } from './profile/ProfileActivityGrid';
import { ProfileAddressesModal } from './profile/ProfileAddressesModal';
import { ProfileOrdersModal } from './profile/ProfileOrdersModal';
import { ProfileDetailsForm } from './profile/ProfileDetailsForm';
import { ProfileOffersSection } from './profile/ProfileOffersSection';
import { ProfileSettingsSection } from './profile/ProfileSettingsSection';
import { Footer } from './Footer';
import tw from 'twrnc';

interface ProfileViewProps {
  onBack?: () => void;
}

/**
 * Single Responsibility Orchestrator:
 * Full-page continuous scrollable profile view integrating modular section components.
 */
export const ProfileView: React.FC<ProfileViewProps> = ({ onBack }) => {
  const router = useRouter();
  const {
    user,
    name,
    setName,
    email,
    setEmail,
    dob,
    setDob,
    isEditing,
    setIsEditing,
    loading,
    toast,
    handleUpdateProfile,
    logout,
  } = useProfile();

  const scrollViewRef = React.useRef<ScrollView>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isAddressesModalOpen, setIsAddressesModalOpen] = React.useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = React.useState(false);

  const handleLogoutAction = async () => {
    await logout();
    router.replace('/login');
  };

  const isAnyModalOpen = isAddressesModalOpen || isOrdersModalOpen;

  return (
    <View style={tw`flex-1 bg-slate-50`}>
      <StatusBar style={isAnyModalOpen ? 'light' : (isScrolled ? 'dark' : 'light')} animated />

      {/* ── Continuous Full-Page Scrollable View (Header + Content together) ── */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={tw`flex-1`}
        contentContainerStyle={[tw`pb-36`, { paddingBottom: 120 }]}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          setIsScrolled(offsetY > 100);
        }}
        scrollEventThrottle={16}
      >
        {/* ── 1. Top Gradient Profile Header ── */}
        <ProfileHeader
          user={user}
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
          onBack={onBack}
        />

        {/* ── 2. Body Container (Overlapping curve gracefully) ── */}
        <View style={tw`px-4 -mt-6`}>
          {/* VIP Plus Membership Card */}
          <ProfileVipCard />

          {/* Wallet & Reward Coins Hub */}
          <ProfileWalletHub
            walletBalance={user?.walletBalance ?? 250}
            loyaltyPoints={user?.loyaltyPoints ?? 140}
          />

          {/* Toast Alert Notice */}
          {toast && (
            <View
              style={[
                tw`mb-4 p-3 rounded-2xl flex-row items-center gap-2 shadow-sm`,
                toast.type === 'error'
                  ? tw`bg-rose-50 border border-rose-200`
                  : toast.type === 'success'
                  ? tw`bg-emerald-50 border border-emerald-200`
                  : tw`bg-blue-50 border border-blue-200`,
              ]}
            >
              <Ionicons
                name={
                  toast.type === 'error'
                    ? 'alert-circle'
                    : toast.type === 'success'
                    ? 'checkmark-circle'
                    : 'information-circle'
                }
                size={16}
                color={
                  toast.type === 'error'
                    ? '#E11D48'
                    : toast.type === 'success'
                    ? '#059669'
                    : '#2563EB'
                }
              />
              <Text
                style={[
                  tw`text-xs font-bold flex-1`,
                  toast.type === 'error'
                    ? tw`text-rose-700`
                    : toast.type === 'success'
                    ? tw`text-emerald-700`
                    : tw`text-blue-700`,
                ]}
              >
                {toast.message}
              </Text>
            </View>
          )}

          {/* Activity & Orders 4-Card Quick Matrix */}
          <ProfileActivityGrid
            onPressOrders={() => setIsOrdersModalOpen(true)}
            onPressAddresses={() => setIsAddressesModalOpen(true)}
          />

          {/* Personal Information Form */}
          <ProfileDetailsForm
            user={user}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            dob={dob}
            setDob={setDob}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            loading={loading}
            onSave={handleUpdateProfile}
          />

          {/* Offers & Rewards Hub */}
          <ProfileOffersSection />

          {/* Preferences, Support & Pro Logout CTA */}
          <ProfileSettingsSection
            onLogout={handleLogoutAction}
            userPhone={user?.phone || '+91 98765 43210'}
          />

          {/* Minimal Branded Footer */}
          <Footer />
        </View>
      </ScrollView>

      {/* ── My Orders Modal Sheet ── */}
      <ProfileOrdersModal
        visible={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />

      {/* ── My Addresses Modal Sheet ── */}
      <ProfileAddressesModal
        visible={isAddressesModalOpen}
        onClose={() => setIsAddressesModalOpen(false)}
      />
    </View>
  );
};
