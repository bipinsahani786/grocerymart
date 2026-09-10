import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../constants/typography';
import tw from 'twrnc';

interface LogoutConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  t: Record<string, string>;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  t,
}) => {
  return (
    <Modal
      visible={visible}
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
            {t.confirmLogoutTitle || 'Log Out from Device?'}
          </Text>
          <Text
            style={[
              Typography.caption,
              { color: '#64748B', fontSize: 11, textAlign: 'center', marginBottom: 16, lineHeight: 16 },
            ]}
          >
            {t.confirmLogoutDesc || 'You will need to verify via OTP to sign back into your captain account.'}
          </Text>

          {/* Action Buttons */}
          <View style={tw`flex-row gap-2.5 w-full`}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={tw`flex-1 py-2.5 rounded-xl bg-slate-100 border border-slate-200 items-center justify-center`}
            >
              <Text style={[Typography.buttonText, { color: '#64748B', fontSize: 11.5 }]}>
                {t.cancel || 'Cancel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={onConfirm}
              style={tw`flex-1 py-2.5 rounded-xl bg-rose-600 border border-rose-500 items-center justify-center shadow-sm`}
            >
              <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' }]}>
                {t.logout || 'Log Out'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
