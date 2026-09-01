import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Switch, Modal, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthContext } from '../../context/AuthContext';
import { useDutyContext } from '../../context/DutyContext';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { SettingsModal } from './SettingsModal';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface PartnerProfileViewProps {
  onOpenDeposit: () => void;
  onOpenSOS: () => void;
  onLogout: () => void;
}

export const PartnerProfileView: React.FC<PartnerProfileViewProps> = ({
  onOpenDeposit,
  onOpenSOS,
  onLogout,
}) => {
  const { user } = useAuthContext();
  const { currentHub } = useDutyContext();
  const { earningsSummary } = useDeliveryContext();
  const { t, language } = useLanguageContext();

  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(
    user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
  );
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [autoNavigate, setAutoNavigate] = useState(true);

  const windowHeight = Dimensions.get('window').height;

  const handlePickFromCamera = async () => {
    setShowAvatarPicker(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to take a profile picture.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setCurrentAvatar(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Error opening camera:', err);
    }
  };

  const handlePickFromGallery = async () => {
    setShowAvatarPicker(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
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
        setCurrentAvatar(result.assets[0].uri);
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
      {/* ================= 1. CARDLESS ELEGANT PROFILE HEADER ================= */}
      <View style={tw`items-center pb-6 border-b border-slate-100 relative`}>
        {/* Top Right Floating Settings Shortcut Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowSettings(true)}
          style={tw`absolute top-0 right-0 w-8 h-8 rounded-full bg-slate-100 items-center justify-center`}
        >
          <Ionicons name="settings-outline" size={16} color="#334155" />
        </TouchableOpacity>

        {/* Avatar with Camera Overlay */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowAvatarPicker(true)}
          style={tw`relative mb-3`}
        >
          <Image
            source={{ uri: currentAvatar }}
            style={tw`w-22 h-22 rounded-full border-2 border-emerald-500 shadow-sm`}
          />

          {/* Camera Change Action Pill */}
          <View style={tw`absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 border-2 border-white items-center justify-center shadow-md`}>
            <Ionicons name="camera" size={13} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Name & Hub */}
        <View style={tw`items-center`}>
          <View style={tw`flex-row items-center gap-1.5`}>
            <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 17, fontWeight: '900' }]}>
              {user?.name || 'Bipin Sahani'}
            </Text>
            <View style={tw`px-1.5 py-0.2 rounded bg-amber-50 border border-amber-200`}>
              <Text style={[Typography.badge, { color: '#B45309', fontSize: 9.5, fontWeight: '800' }]}>
                ★ {user?.rating || '4.95'}
              </Text>
            </View>
          </View>

          <Text style={[Typography.caption, { color: '#64748B', fontSize: 11, marginTop: 2 }]}>
            Partner ID: {user?.id || 'CAP-9921'} • +91 {user?.phone || '9876543210'}
          </Text>
          <Text style={[Typography.caption, { color: '#047857', fontSize: 11, fontWeight: '700', marginTop: 2 }]}>
            📍 {currentHub || 'Koramangala Dark Store #04'}
          </Text>
        </View>

        {/* 3 Inline Telemetry Metrics (Flat, No Boxes) */}
        <View style={tw`flex-row justify-center items-center gap-6 mt-4 pt-4 border-t border-slate-100 w-full`}>
          <View style={tw`items-center`}>
            <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 15, fontWeight: '900' }]}>
              1,420
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
              {t.lifetimeTrips}
            </Text>
          </View>

          <View style={tw`w-px h-6 bg-slate-200`} />

          <View style={tw`items-center`}>
            <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 15, fontWeight: '900' }]}>
              99.2%
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
              {t.onTimeRate}
            </Text>
          </View>

          <View style={tw`w-px h-6 bg-slate-200`} />

          <View style={tw`items-center`}>
            <Text style={[Typography.amountLarge, { color: '#D97706', fontSize: 15, fontWeight: '900' }]}>
              Gold Pro
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
              {t.partnerTier}
            </Text>
          </View>
        </View>
      </View>

      {/* ================= 2. CARDLESS FLAT SECTION: FLEET & COMPLIANCE ================= */}
      <View style={tw`py-4 border-b border-slate-100`}>
        <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
          {t.fleetVerification}
        </Text>

        {/* Vehicle */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={tw`flex-row justify-between items-center py-2.5`}
        >
          <View style={tw`flex-row items-center flex-1 mr-2`}>
            <Ionicons name="bicycle" size={17} color="#2563EB" style={tw`mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                {t.registeredVehicle}
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                Honda Activa 6G • KA-01-EQ-8842
              </Text>
            </View>
          </View>
          <View style={tw`flex-row items-center`}>
            <Text style={[Typography.badge, { color: '#047857', fontSize: 9.5, marginRight: 2 }]}>{t.active}</Text>
            <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
          </View>
        </TouchableOpacity>

        {/* KYC Docs */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}
        >
          <View style={tw`flex-row items-center flex-1 mr-2`}>
            <Ionicons name="document-text-outline" size={17} color="#047857" style={tw`mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                {t.kycLicense}
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                DL • PAN • Aadhaar ({t.verified})
              </Text>
            </View>
          </View>
          <View style={tw`flex-row items-center`}>
            <Text style={[Typography.badge, { color: '#047857', fontSize: 9.5, marginRight: 2 }]}>{t.verified}</Text>
            <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
          </View>
        </TouchableOpacity>

        {/* Insurance */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}
        >
          <View style={tw`flex-row items-center flex-1 mr-2`}>
            <Ionicons name="medkit-outline" size={17} color="#7C3AED" style={tw`mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                {t.medicalInsurance}
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                ₹5 Lakh Group Insurance Active
              </Text>
            </View>
          </View>
          <View style={tw`flex-row items-center`}>
            <Text style={[Typography.badge, { color: '#7C3AED', fontSize: 9.5, marginRight: 2 }]}>{t.active}</Text>
            <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
          </View>
        </TouchableOpacity>
      </View>

      {/* ================= 3. CARDLESS FLAT SECTION: PREFERENCES & SETTINGS ================= */}
      <View style={tw`py-4 border-b border-slate-100`}>
        <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
          {t.preferencesApp}
        </Text>

        {/* Full Settings Entry */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowSettings(true)}
          style={tw`flex-row justify-between items-center py-2.5`}
        >
          <View style={tw`flex-row items-center flex-1 mr-2`}>
            <Ionicons name="options-outline" size={17} color="#047857" style={tw`mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                {t.allSettings}
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                Audio ringtones, navigation, language & cache
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
        </TouchableOpacity>

        {/* App Language Selector Row */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowSettings(true)}
          style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}
        >
          <View style={tw`flex-row items-center flex-1 mr-2`}>
            <Ionicons name="globe-outline" size={17} color="#475569" style={tw`mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                {t.appLanguage}
              </Text>
              <Text style={[Typography.caption, { color: '#047857', fontSize: 10, fontWeight: '700' }]}>
                {languageLabel}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
        </TouchableOpacity>

        {/* Audio Siren Switch */}
        <View style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}>
          <View style={tw`flex-row items-center flex-1 mr-2`}>
            <Ionicons name="volume-high-outline" size={17} color="#475569" style={tw`mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                {t.orderSiren}
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                High-volume audio ring for incoming orders
              </Text>
            </View>
          </View>
          <Switch
            value={audioAlerts}
            onValueChange={setAudioAlerts}
            trackColor={{ false: '#E2E8F0', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Auto Navigation Switch */}
        <View style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}>
          <View style={tw`flex-row items-center flex-1 mr-2`}>
            <Ionicons name="navigate-outline" size={17} color="#475569" style={tw`mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                {t.autoNav}
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                Auto-start directions on trip accept
              </Text>
            </View>
          </View>
          <Switch
            value={autoNavigate}
            onValueChange={setAutoNavigate}
            trackColor={{ false: '#E2E8F0', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* ================= 4. CARDLESS FLAT SECTION: SAFETY & LOGOUT ================= */}
      <View style={tw`py-4`}>
        <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
          {t.safetyAccount}
        </Text>

        {/* 24/7 SOS */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenSOS}
          style={tw`flex-row items-center justify-between py-2.5`}
        >
          <View style={tw`flex-row items-center`}>
            <Ionicons name="shield-outline" size={17} color="#E11D48" style={tw`mr-3`} />
            <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
              {t.safetySOS}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowLogoutConfirm(true)}
          style={tw`flex-row items-center justify-between py-2.5 border-t border-slate-50`}
        >
          <View style={tw`flex-row items-center`}>
            <Ionicons name="log-out-outline" size={17} color="#DC2626" style={tw`mr-3`} />
            <Text style={[Typography.bodyBold, { color: '#DC2626', fontSize: 12 }]}>
              {t.logout}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
        </TouchableOpacity>
      </View>

      {/* ================= 5. AVATAR UPLOAD BOTTOM SHEET MODAL ================= */}
      <Modal
        visible={showAvatarPicker}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowAvatarPicker(false)}
      >
        <View style={[tw`flex-1 justify-end`, { backgroundColor: 'rgba(15, 23, 42, 0.65)' }]}>
          <View style={tw`bg-white rounded-t-3xl border-t border-emerald-500 shadow-2xl p-4 pb-7`}>
            {/* Grabber */}
            <View style={tw`w-10 h-1 bg-slate-200 rounded-full self-center mb-3`} />

            {/* Title */}
            <View style={tw`flex-row justify-between items-center pb-3 border-b border-slate-100 mb-3`}>
              <View>
                <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 14, fontWeight: '900' }]}>
                  Update Profile Avatar
                </Text>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                  Upload a clear captain photo for customer verification
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAvatarPicker(false)} style={tw`w-7 h-7 rounded-full bg-slate-100 items-center justify-center`}>
                <Ionicons name="close" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <View style={tw`gap-2.5 mb-4`}>
              {/* Option 1: Camera */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePickFromCamera}
                style={tw`p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex-row items-center justify-between`}
              >
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-9 h-9 rounded-xl bg-emerald-600 items-center justify-center mr-3 shadow-sm`}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={[Typography.bodyBold, { color: '#064E3B', fontSize: 12.5 }]}>
                      Take Photo with Camera
                    </Text>
                    <Text style={[Typography.caption, { color: '#047857', fontSize: 10 }]}>
                      Take a new selfie in delivery uniform
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#047857" />
              </TouchableOpacity>

              {/* Option 2: Gallery */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePickFromGallery}
                style={tw`p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex-row items-center justify-between`}
              >
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-9 h-9 rounded-xl bg-blue-600 items-center justify-center mr-3 shadow-sm`}>
                    <Ionicons name="images" size={16} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12.5 }]}>
                      Choose from Photo Gallery
                    </Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                      Select existing photo from device album
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowAvatarPicker(false)}
              style={tw`w-full py-3 rounded-2xl bg-slate-100 border border-slate-200 items-center justify-center`}
            >
              <Text style={[Typography.buttonText, { color: '#64748B', fontSize: 11.5 }]}>
                {t.cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= 6. LOGOUT CONFIRMATION MODAL ================= */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={[tw`flex-1 items-center justify-center p-5`, { backgroundColor: 'rgba(15, 23, 42, 0.7)' }]}>
          <View style={tw`w-full max-w-84 bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 items-center`}>
            {/* Warning Icon */}
            <View style={tw`w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 items-center justify-center mb-3`}>
              <Ionicons name="log-out-outline" size={24} color="#DC2626" />
            </View>

            <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 15, marginBottom: 4, textAlign: 'center' }]}>
              {t.confirmLogoutTitle}
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 11, textAlign: 'center', marginBottom: 16, lineHeight: 16 }]}>
              {t.confirmLogoutDesc}
            </Text>

            {/* Action Buttons */}
            <View style={tw`flex-row gap-2.5 w-full`}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowLogoutConfirm(false)}
                style={tw`flex-1 py-2.5 rounded-xl bg-slate-100 border border-slate-200 items-center justify-center`}
              >
                <Text style={[Typography.buttonText, { color: '#64748B', fontSize: 11.5 }]}>
                  {t.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleConfirmLogout}
                style={tw`flex-1 py-2.5 rounded-xl bg-rose-600 border border-rose-500 items-center justify-center shadow-sm`}
              >
                <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' }]}>
                  {t.logout}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full-Screen Settings Page */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={onLogout}
      />
    </View>
  );
};
