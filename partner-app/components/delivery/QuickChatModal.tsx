import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface QuickChatModalProps {
  visible: boolean;
  customerName: string;
  customerPhone?: string;
  orderNumber: string;
  onClose: () => void;
}

export const QuickChatModal: React.FC<QuickChatModalProps> = ({
  visible,
  customerName,
  customerPhone = '+919876543210',
  orderNumber,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [customMessage, setCustomMessage] = useState('');
  const [sentMessages, setSentMessages] = useState<string[]>([
    'Hello! I have accepted your GroceryMart order and heading to pickup.',
  ]);

  const quickPresets = [
    { id: '1', text: '📍 I have arrived at your building gate / security desk.' },
    { id: '2', text: '🔑 Please keep your 4-digit doorstep delivery OTP ready.' },
    { id: '3', text: '🛵 Heavy traffic on the way, arriving in approx 3-4 mins.' },
    { id: '4', text: '📦 Handed over your package to building security guard.' },
    { id: '5', text: '🔔 Left package at your doorstep and rang the bell.' },
    { id: '6', text: '❓ Unable to locate your flat, please call me or check door.' },
  ];

  const handleSendPreset = (msg: string) => {
    setSentMessages((prev) => [...prev, msg]);
  };

  const handleSendCustom = () => {
    if (!customMessage.trim()) return;
    setSentMessages((prev) => [...prev, customMessage.trim()]);
    setCustomMessage('');
  };

  const handleWhatsAppChat = () => {
    const text = encodeURIComponent(`Hi ${customerName}, I am your GroceryMart delivery partner for order #${orderNumber}.`);
    Linking.openURL(`whatsapp://send?phone=${customerPhone}&text=${text}`).catch(() => {
      Linking.openURL(`tel:${customerPhone}`).catch(() => {});
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={[tw`flex-1 justify-end`, { backgroundColor: 'rgba(15, 23, 42, 0.65)' }]}>
        <View
          style={[
            tw`bg-white rounded-t-3xl border-t border-emerald-500 shadow-2xl p-4 max-h-[82%]`,
            { paddingBottom: Math.max(insets.bottom, 20) + 12 },
          ]}
        >
          {/* Grabber */}
          <View style={tw`w-10 h-1 rounded-full bg-slate-200 self-center mb-2`} />

          {/* Header */}
          <View style={tw`flex-row justify-between items-center pb-3 border-b border-slate-100 mb-3`}>
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <View style={tw`w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 items-center justify-center mr-2.5`}>
                <Ionicons name="chatbubble-ellipses" size={15} color="#047857" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13 }]}>
                  Chat with {customerName}
                </Text>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
                  Order #{orderNumber} • Instant Delivery
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-center gap-2`}>
              {/* WhatsApp Shortcut */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleWhatsAppChat}
                style={tw`px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 flex-row items-center`}
              >
                <Ionicons name="logo-whatsapp" size={12} color="#047857" style={tw`mr-1`} />
                <Text style={[Typography.badge, { color: '#047857', fontSize: 9 }]}>
                  WhatsApp
                </Text>
              </TouchableOpacity>

              {/* Close */}
              <TouchableOpacity onPress={onClose} style={tw`w-7 h-7 rounded-full bg-slate-100 items-center justify-center`}>
                <Ionicons name="close" size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Message Stream */}
          <ScrollView style={tw`max-h-48 mb-3`} showsVerticalScrollIndicator={false}>
            <View style={tw`gap-2`}>
              {sentMessages.map((msg, idx) => (
                <View key={idx} style={tw`self-end max-w-[85%] p-2.5 rounded-2xl rounded-br-sm bg-emerald-600 shadow-sm`}>
                  <Text style={[Typography.caption, { color: '#FFFFFF', fontSize: 11 }]}>
                    {msg}
                  </Text>
                  <Text style={[Typography.caption, { color: '#A7F3D0', fontSize: 8, alignSelf: 'flex-end', marginTop: 2 }]}>
                    Just now • Sent ✓
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* 1-Tap Quick Presets */}
          <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5, fontWeight: '800', marginBottom: 6 }]}>
            1-TAP QUICK REPLIES
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`gap-1.5 pb-2 mb-2`}>
            {quickPresets.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                activeOpacity={0.75}
                onPress={() => handleSendPreset(preset.text)}
                style={tw`px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm`}
              >
                <Text style={[Typography.caption, { color: '#334155', fontSize: 10, fontWeight: '600' }]}>
                  {preset.text}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Custom Message Input Bar */}
          <View style={tw`flex-row items-center gap-2 pt-2 border-t border-slate-100`}>
            <TextInput
              value={customMessage}
              onChangeText={setCustomMessage}
              placeholder="Type custom update..."
              placeholderTextColor="#94A3B8"
              style={tw`flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900`}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSendCustom}
              style={tw`w-10 h-10 rounded-xl bg-emerald-600 items-center justify-center shadow-sm`}
            >
              <Ionicons name="send" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
