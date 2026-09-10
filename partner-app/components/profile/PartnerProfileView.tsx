import React, { useState } from 'react';
import { View, Dimensions, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthContext } from '../../context/AuthContext';
import { useDutyContext } from '../../context/DutyContext';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { partnerAuthService } from '../../services/partnerAuth.service';
import { SettingsModal } from './SettingsModal';
import { EditProfileModal } from './EditProfileModal';
import { ProfileWalletCard } from './ProfileWalletCard';
import { RiderSubscriptionModal } from './RiderSubscriptionModal';
import {
  ProfileHeroHeader,
  FleetComplianceSection,
  BankPayoutSection,
  PersonalResidenceSection,
  PreferencesSection,
  SafetyLogoutSection,
  AvatarPickerModal,
  LogoutConfirmModal,
} from './view';
import tw from 'twrnc';

interface PartnerProfileViewProps {
  onOpenDeposit: () => void;
  onOpenSOS: () => void;
  onLogout: () => void;
  onOpenWallet?: () => void;
}

export const PartnerProfileView: React.FC<PartnerProfileViewProps> = ({
  onOpenDeposit,
  onOpenSOS,
  onLogout,
  onOpenWallet,
}) => {
  const { user, deliveryPartner, token, updateProfile } = useAuthContext();
  const { currentHub } = useDutyContext();
  const { earningsSummary } = useDeliveryContext();
  const { t, language } = useLanguageContext();

  // Modal Visibility States
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [currentAvatar, setCurrentAvatar] = useState(
    user?.avatar || deliveryPartner?.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
  );
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [autoNavigate, setAutoNavigate] = useState(true);

  const windowHeight = Dimensions.get('window').height;

  // Real Database Metrics & Attributes
  const realWallet = Number(earningsSummary.walletBalance ?? user?.walletBalance ?? 0);
  const realDeliveries = Number(deliveryPartner?.totalDeliveries ?? user?.totalDeliveries ?? 0);
  const realTotalEarned = Number(deliveryPartner?.totalEarnings ?? 0);
  const realRating = Number(user?.rating || deliveryPartner?.rating || 5.0).toFixed(1);
  const partnerTier = realDeliveries >= 50 ? 'Gold Pro' : realDeliveries >= 20 ? 'Silver Partner' : 'Bronze Captain';

  const partnerId = deliveryPartner?.id
    ? `CAP-${deliveryPartner.id.slice(0, 6).toUpperCase()}`
    : user?.id
      ? `CAP-${user.id.slice(0, 6).toUpperCase()}`
      : 'CAP-NEW';

  const realName = user?.name || deliveryPartner?.user?.name || 'Partner Captain';
  const realPhone = user?.phone || deliveryPartner?.user?.phone || '';
  const realHub = deliveryPartner?.allocatedHub || currentHub || user?.currentHub || 'Assigned Store Hub';

  // Vehicle Information
  const vehicleModel = deliveryPartner?.vehicleModel || (deliveryPartner?.vehicleType ? deliveryPartner.vehicleType.replace(/_/g, ' ') : 'Electric Bike');
  const vehicleRc = deliveryPartner?.rcNumber || 'RC Pending';
  const isVehicleActive = Boolean(deliveryPartner?.rcNumber);

  // KYC Documentation
  const kycStatus = deliveryPartner?.kycStatus || 'PENDING';
  const isKycApproved = kycStatus === 'APPROVED';
  const dlText = deliveryPartner?.dlNumber ? `DL: ${deliveryPartner.dlNumber}` : 'DL Pending';
  const panText = deliveryPartner?.panNumber ? `PAN: ${deliveryPartner.panNumber}` : 'PAN Pending';
  const aadhaarText = deliveryPartner?.aadhaarNumber ? `Aadhaar: •••• ${deliveryPartner.aadhaarNumber.slice(-4)}` : 'Aadhaar Pending';

  // Bank Account & Payouts
  const bankHolder = deliveryPartner?.bankHolderName || user?.name || 'Not Added';
  const bankAccount = deliveryPartner?.bankAccountNumber ? `•••• •••• ${deliveryPartner.bankAccountNumber.slice(-4)}` : 'Not Linked';
  const bankIfsc = deliveryPartner?.bankIfsc || 'N/A';
  const hasBankAccount = Boolean(deliveryPartner?.bankAccountNumber);

  // Personal & Residence
  const realEmail = user?.email || deliveryPartner?.user?.email || '';
  const cityPincode = deliveryPartner?.city ? `${deliveryPartner.city}${deliveryPartner.pincode ? ` (${deliveryPartner.pincode})` : ''}` : deliveryPartner?.address || 'Not Added';
  const bloodGroup = deliveryPartner?.bloodGroup || 'Not Specified';
  const emergencyContact = deliveryPartner?.emergencyContact || 'Not Added';

  // Subscription Details (NONE by default, bought later by rider)
  const hasSubscription = Boolean(deliveryPartner?.hasSubscription ?? user?.hasSubscription);
  const subscriptionPlan = deliveryPartner?.subscriptionPlan || user?.subscriptionPlan || null;
  const subscriptionExpiry = deliveryPartner?.subscriptionExpiry || user?.subscriptionExpiry || null;

  const handlePickFromCamera = async () => {
    setShowAvatarPicker(false);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Denied', 'Camera access is required to take a profile picture.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const localUri = result.assets[0].uri;
        setCurrentAvatar(localUri);

        try {
          const r2Url = await partnerAuthService.uploadImage(localUri, token);
          if (r2Url) {
            setCurrentAvatar(r2Url);
            updateProfile({ avatar: r2Url });
            if (token) {
              await partnerAuthService.updateProfile({ avatar: r2Url }, token);
            }
          }
        } catch (uploadErr) {
          console.warn('Avatar upload to R2 error:', uploadErr);
        }
      }
    } catch (err) {
      console.log('Error opening camera:', err);
    }
  };

  const handlePickFromGallery = async () => {
    setShowAvatarPicker(false);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Denied', 'Gallery access is required to select a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const localUri = result.assets[0].uri;
        setCurrentAvatar(localUri);

        try {
          const r2Url = await partnerAuthService.uploadImage(localUri, token);
          if (r2Url) {
            setCurrentAvatar(r2Url);
            updateProfile({ avatar: r2Url });
            if (token) {
              await partnerAuthService.updateProfile({ avatar: r2Url }, token);
            }
          }
        } catch (uploadErr) {
          console.warn('Avatar upload to R2 error:', uploadErr);
        }
      }
    } catch (err) {
      console.log('Error opening gallery:', err);
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const languageLabel = language === 'EN' ? 'English (Default)' : language === 'HI' ? 'हिन्दी (Hindi)' : 'ಕನ್ನಡ (Kannada)';

  return (
    <View style={[tw`px-5 pt-3 pb-36 bg-white flex-1`, { minHeight: windowHeight }]}>
      {/* 1. Cardless Elegant Profile Header */}
      <ProfileHeroHeader
        currentAvatar={currentAvatar}
        realName={realName}
        realRating={realRating}
        partnerId={partnerId}
        realPhone={realPhone}
        realHub={realHub}
        realDeliveries={realDeliveries}
        onTimeRate={user?.onTimeRate || 100}
        partnerTier={partnerTier}
        t={t as any}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAvatarPicker={() => setShowAvatarPicker(true)}
        onOpenEditProfile={() => setShowEditProfile(true)}
      />

      {/* 2. Account Wallet Balance Card (Real DB Data) */}
      <ProfileWalletCard
        realWallet={realWallet}
        realTotalEarned={realTotalEarned}
        onOpenWallet={onOpenWallet}
        onOpenDeposit={onOpenDeposit}
      />

      {/* 3. Cardless Flat Section: Fleet & Compliance */}
      <FleetComplianceSection
        vehicleModel={vehicleModel}
        vehicleRc={vehicleRc}
        isVehicleActive={isVehicleActive}
        dlText={dlText}
        panText={panText}
        aadhaarText={aadhaarText}
        isKycApproved={isKycApproved}
        kycStatus={kycStatus}
        hasSubscription={hasSubscription}
        subscriptionPlan={subscriptionPlan}
        subscriptionExpiry={subscriptionExpiry}
        t={t as any}
        onOpenEditProfile={() => setShowEditProfile(true)}
        onOpenSubscription={() => setShowSubscriptionModal(true)}
      />

      {/* 4. Cardless Flat Section: Bank & Daily Payouts */}
      <BankPayoutSection
        bankHolder={bankHolder}
        bankAccount={bankAccount}
        bankIfsc={bankIfsc}
        hasBankAccount={hasBankAccount}
        onOpenEditProfile={() => setShowEditProfile(true)}
      />

      {/* 5. Cardless Flat Section: Personal & Residence */}
      <PersonalResidenceSection
        cityPincode={cityPincode}
        emergencyContact={emergencyContact}
        bloodGroup={bloodGroup}
        realEmail={realEmail}
        onOpenEditProfile={() => setShowEditProfile(true)}
      />

      {/* 6. Cardless Flat Section: Preferences & Settings */}
      <PreferencesSection
        languageLabel={languageLabel}
        audioAlerts={audioAlerts}
        setAudioAlerts={setAudioAlerts}
        autoNavigate={autoNavigate}
        setAutoNavigate={setAutoNavigate}
        t={t as any}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* 7. Cardless Flat Section: Safety & Logout */}
      <SafetyLogoutSection
        t={t as any}
        onOpenSOS={onOpenSOS}
        onOpenLogoutConfirm={() => setShowLogoutConfirm(true)}
      />

      {/* 8. Avatar Upload Bottom Sheet Modal */}
      <AvatarPickerModal
        visible={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        onPickCamera={handlePickFromCamera}
        onPickGallery={handlePickFromGallery}
      />

      {/* 9. Logout Confirmation Modal */}
      <LogoutConfirmModal
        visible={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        t={t as any}
      />

      {/* 10. Full-Screen Settings Page */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={onLogout}
      />

      {/* 11. Full-Screen Edit Profile Page */}
      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />

      {/* 12. Captain Subscription Pass Modal */}
      <RiderSubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </View>
  );
};
