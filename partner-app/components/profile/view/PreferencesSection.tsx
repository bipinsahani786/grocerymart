import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../constants/typography';
import tw from 'twrnc';

interface PreferencesSectionProps {
  languageLabel: string;
  audioAlerts: boolean;
  setAudioAlerts: (val: boolean) => void;
  autoNavigate: boolean;
  setAutoNavigate: (val: boolean) => void;
  t: Record<string, string>;
  onOpenSettings: () => void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  languageLabel,
  audioAlerts,
  setAudioAlerts,
  autoNavigate,
  setAutoNavigate,
  t,
  onOpenSettings,
}) => {
  return (
    <View style={tw`py-4 border-b border-slate-100`}>
      <Text
        style={[
          Typography.caption,
          { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 },
        ]}
      >
        {t.preferencesApp || 'PREFERENCES & SETTINGS'}
      </Text>

      {/* Full Settings Entry */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenSettings}
        style={tw`flex-row justify-between items-center py-2.5`}
      >
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <Ionicons name="options-outline" size={17} color="#047857" style={tw`mr-3`} />
          <View style={tw`flex-1`}>
            <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
              {t.allSettings || 'All Settings'}
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
        onPress={onOpenSettings}
        style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}
      >
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <Ionicons name="globe-outline" size={17} color="#475569" style={tw`mr-3`} />
          <View style={tw`flex-1`}>
            <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
              {t.appLanguage || 'App Language'}
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
              {t.orderSiren || 'Order Alert Siren'}
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
              {t.autoNav || 'Auto-Navigation'}
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
  );
};
