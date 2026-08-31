import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Switch, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { useDutyContext } from '../../context/DutyContext';
import { useDeliveryContext } from '../../context/DeliveryContext';
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
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [autoNavigate, setAutoNavigate] = useState(true);

  const windowHeight = Dimensions.get('window').height;

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <View style={[tw`px-5 pt-3 pb-36 bg-white flex-1`, { minHeight: windowHeight }]}>
      {/* ================= 1. CARDLESS ELEGANT PROFILE HEADER ================= */}
      <View style={tw`items-center pb-6 border-b border-slate-100`}>
        {/* Avatar */}
        <View style={tw`relative mb-3`}>
          <Image
            source={{
              uri:
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            }}
            style={tw`w-20 h-20 rounded-full border-2 border-emerald-500`}
          />
          <View style={tw`absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white items-center justify-center`}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
        </View>

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
              Lifetime Trips
            </Text>
          </View>

          <View style={tw`w-px h-6 bg-slate-200`} />

          <View style={tw`items-center`}>
            <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 15, fontWeight: '900' }]}>
              99.2%
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
              On-Time Rate
            </Text>
          </View>

          <View style={tw`w-px h-6 bg-slate-200`} />

          <View style={tw`items-center`}>
            <Text style={[Typography.amountLarge, { color: '#D97706', fontSize: 15, fontWeight: '900' }]}>
              Gold Pro
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
              Partner Tier
            </Text>
          </View>
        </View>
      </View>

      {/* ================= 2. CARDLESS FLAT SECTION: FLEET & COMPLIANCE ================= */}
      <View style={tw`py-4 border-b border-slate-100`}>
        <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
          FLEET & VERIFICATION
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
                Registered Delivery Vehicle
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                Honda Activa 6G • KA-01-EQ-8842
              </Text>
            </View>
          </View>
          <View style={tw`flex-row items-center`}>
            <Text style={[Typography.badge, { color: '#047857', fontSize: 9.5, marginRight: 2 }]}>Active</Text>
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
                KYC & Driving License
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                DL • PAN • Aadhaar (All Verified)
              </Text>
            </View>
          </View>
          <View style={tw`flex-row items-center`}>
            <Text style={[Typography.badge, { color: '#047857', fontSize: 9.5, marginRight: 2 }]}>Verified</Text>
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
                Medical & Accident Cover
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                ₹5 Lakh Group Insurance Active
              </Text>
            </View>
          </View>
          <View style={tw`flex-row items-center`}>
            <Text style={[Typography.badge, { color: '#7C3AED', fontSize: 9.5, marginRight: 2 }]}>Active</Text>
            <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
          </View>
        </TouchableOpacity>
      </View>

      {/* ================= 3. CARDLESS FLAT SECTION: PREFERENCES ================= */}
      <View style={tw`py-4 border-b border-slate-100`}>
        <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
          PREFERENCES & APP
        </Text>

        {/* Audio Siren Switch */}
        <View style={tw`flex-row justify-between items-center py-2.5`}>
          <View style={tw`flex-row items-center flex-1 mr-2`}>
            <Ionicons name="volume-high-outline" size={17} color="#475569" style={tw`mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                Order Alert Siren
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
                Auto Google Maps Navigation
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

        {/* Language */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowSettings(true)}
          style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}
        >
          <View style={tw`flex-row items-center flex-1 mr-2`}>
            <Ionicons name="globe-outline" size={17} color="#475569" style={tw`mr-3`} />
            <View style={tw`flex-1`}>
              <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                App Language
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                English (Default) • हिन्दी Supported
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
        </TouchableOpacity>
      </View>

      {/* ================= 4. CARDLESS FLAT SECTION: SAFETY & LOGOUT ================= */}
      <View style={tw`py-4`}>
        <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
          SAFETY & ACCOUNT
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
              Safety Center & 24/7 Emergency SOS
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
        </TouchableOpacity>

        {/* Logout (Prompts Confirmation Modal) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowLogoutConfirm(true)}
          style={tw`flex-row items-center justify-between py-2.5 border-t border-slate-50`}
        >
          <View style={tw`flex-row items-center`}>
            <Ionicons name="log-out-outline" size={17} color="#DC2626" style={tw`mr-3`} />
            <Text style={[Typography.bodyBold, { color: '#DC2626', fontSize: 12 }]}>
              Logout
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
        </TouchableOpacity>
      </View>

      {/* ================= 5. LOGOUT CONFIRMATION MODAL ================= */}
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
              Confirm Logout
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 11, textAlign: 'center', marginBottom: 16, lineHeight: 16 }]}>
              Are you sure you want to go offline and log out of your delivery partner account?
            </Text>

            {/* Action Buttons */}
            <View style={tw`flex-row gap-2.5 w-full`}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowLogoutConfirm(false)}
                style={tw`flex-1 py-2.5 rounded-xl bg-slate-100 border border-slate-200 items-center justify-center`}
              >
                <Text style={[Typography.buttonText, { color: '#64748B', fontSize: 11.5 }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleConfirmLogout}
                style={tw`flex-1 py-2.5 rounded-xl bg-rose-600 border border-rose-500 items-center justify-center shadow-sm`}
              >
                <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onLogout={onLogout}
      />
    </View>
  );
};
