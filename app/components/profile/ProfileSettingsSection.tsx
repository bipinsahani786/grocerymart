import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

interface ProfileSettingsSectionProps {
  onLogout: () => void;
  userPhone?: string;
}

/**
 * Single Responsibility: Order notification toggles, support, privacy, and pro-tier sign out button.
 */
export const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
  onLogout,
  userPhone = '+91 98765 43210',
}) => {
  const [orderNotifications, setOrderNotifications] = useState(true);

  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your Grocery Mart account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 px-1`}>
        Preferences & Support
      </Text>
      <View style={tw`rounded-3xl bg-white border border-slate-100 p-2 mb-4 shadow-sm`}>
        {/* Notifications Toggle */}
        <View style={tw`flex-row items-center justify-between p-3 border-b border-slate-50`}>
          <View style={tw`flex-row items-center gap-3`}>
            <View style={tw`w-8 h-8 rounded-xl bg-blue-50 items-center justify-center`}>
              <Ionicons name="notifications-outline" size={17} color="#2563EB" />
            </View>
            <View>
              <Text style={tw`text-xs font-black text-slate-800`}>Order SMS & Alerts</Text>
              <Text style={tw`text-[10px] font-medium text-slate-400`}>Live delivery updates</Text>
            </View>
          </View>
          <Switch
            value={orderNotifications}
            onValueChange={setOrderNotifications}
            trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
            thumbColor={orderNotifications ? '#059669' : '#CBD5E1'}
          />
        </View>

        {/* Help & Support */}
        <TouchableOpacity style={tw`flex-row items-center justify-between p-3 border-b border-slate-50`}>
          <View style={tw`flex-row items-center gap-3`}>
            <View style={tw`w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center`}>
              <Ionicons name="headset-outline" size={17} color="#059669" />
            </View>
            <View>
              <Text style={tw`text-xs font-black text-slate-800`}>Customer Support 24/7</Text>
              <Text style={tw`text-[10px] font-medium text-slate-400`}>Chat with our grocery care team</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>

        {/* Privacy & Legal */}
        <TouchableOpacity style={tw`flex-row items-center justify-between p-3`}>
          <View style={tw`flex-row items-center gap-3`}>
            <View style={tw`w-8 h-8 rounded-xl bg-slate-100 items-center justify-center`}>
              <Ionicons name="document-text-outline" size={17} color="#64748B" />
            </View>
            <View>
              <Text style={tw`text-xs font-black text-slate-800`}>Terms & Privacy Policy</Text>
              <Text style={tw`text-[10px] font-medium text-slate-400`}>Legal & consumer agreements</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* ── Pro-Tier Modern Logout Card ── */}
      <TouchableOpacity
        onPress={confirmSignOut}
        activeOpacity={0.8}
        style={tw`p-3.5 rounded-3xl bg-white border border-rose-100/80 mb-2 shadow-xs flex-row items-center justify-between`}
      >
        <View style={tw`flex-row items-center gap-3`}>
          <View style={tw`w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100/60 items-center justify-center`}>
            <Ionicons name="power" size={19} color="#E11D48" />
          </View>
          <View>
            <Text style={tw`text-sm font-black text-rose-600 tracking-tight`}>
              Sign Out
            </Text>
            <Text style={tw`text-[10px] font-medium text-slate-400 mt-0.5`}>
              {userPhone} • Tap to switch account
            </Text>
          </View>
        </View>

        <View style={tw`w-8 h-8 rounded-full bg-rose-50/70 items-center justify-center`}>
          <Ionicons name="log-out-outline" size={16} color="#E11D48" />
        </View>
      </TouchableOpacity>
    </View>
  );
};
