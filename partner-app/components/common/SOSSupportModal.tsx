import React from 'react';
import { View, Text, TouchableOpacity, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface SOSSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SOSSupportModal: React.FC<SOSSupportModalProps> = ({ visible, onClose }) => {
  const handleCallEmergency = () => {
    Linking.openURL('tel:112').catch(() => {});
  };

  const handleCallHelpline = () => {
    Linking.openURL('tel:1800123456').catch(() => {});
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={[tw`flex-1 items-center justify-center p-4`, { backgroundColor: 'rgba(15, 23, 42, 0.7)' }]}>
        <View style={tw`w-full max-w-92 bg-white rounded-3xl p-4 shadow-2xl border border-rose-200`}>
          {/* Header */}
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-7 h-7 rounded-lg bg-rose-100 border border-rose-200 items-center justify-center mr-2`}>
                <Ionicons name="shield-outline" size={14} color="#E11D48" />
              </View>
              <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13 }]}>
                Rider Safety & SOS Support
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={tw`w-7 h-7 rounded-full bg-slate-100 items-center justify-center`}
            >
              <Ionicons name="close" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Quick SOS Emergency Alert Card */}
          <View style={tw`p-3 rounded-2xl bg-rose-50 border border-rose-200 mb-3`}>
            <View style={tw`flex-row items-center mb-1`}>
              <Ionicons name="warning" size={14} color="#E11D48" style={tw`mr-1.5`} />
              <Text style={[Typography.cardTitle, { color: '#9F1239', fontSize: 12 }]}>
                Emergency SOS Trigger
              </Text>
            </View>
            <Text style={[Typography.caption, { color: '#881337', fontSize: 10, marginBottom: 8 }]}>
              Instantly alert nearest safety response team and dial 112 emergency services.
            </Text>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleCallEmergency}
              style={tw`py-2 rounded-xl bg-rose-600 border border-rose-500 items-center justify-center flex-row shadow-sm`}
            >
              <Ionicons name="call" size={13} color="#FFFFFF" style={tw`mr-1.5`} />
              <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 11, fontWeight: '800' }]}>
                TRIGGER EMERGENCY SOS (112)
              </Text>
            </TouchableOpacity>
          </View>

          {/* 24/7 Support Helpline */}
          <View style={tw`p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-3`}>
            <View style={tw`flex-row items-center justify-between mb-1`}>
              <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 11 }]}>
                GroceryMart Partner Helpline
              </Text>
              <Text style={[Typography.badge, { color: '#047857', fontSize: 8 }]}>
                Available 24/7
              </Text>
            </View>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 9, marginBottom: 8 }]}>
              For trip issues, dark store disputes, or payment settlements.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleCallHelpline}
              style={tw`py-2 rounded-xl bg-white border border-slate-300 items-center justify-center flex-row`}
            >
              <Ionicons name="headset-outline" size={13} color="#334155" style={tw`mr-1.5`} />
              <Text style={[Typography.buttonText, { color: '#334155', fontSize: 10, fontWeight: '700' }]}>
                Call Partner Support (Toll-Free)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Close Action */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={tw`py-2 rounded-xl bg-slate-100 items-center justify-center`}
          >
            <Text style={[Typography.buttonText, { color: '#64748B', fontSize: 10 }]}>
              Dismiss
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
