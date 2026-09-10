import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../constants/typography';
import tw from 'twrnc';

interface EditProfileHeaderProps {
  safeTop: number;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const EditProfileHeader: React.FC<EditProfileHeaderProps> = ({
  safeTop,
  saving,
  onClose,
  onSave,
}) => {
  return (
    <View
      style={[
        tw`px-4 pb-3 bg-white border-b border-slate-100 flex-row items-center justify-between shadow-sm`,
        { paddingTop: Platform.OS === 'ios' ? Math.max(safeTop - 10, 8) : 8 },
      ]}
    >
      <TouchableOpacity onPress={onClose} style={tw`p-1.5 -ml-1`}>
        <Ionicons name="arrow-back" size={22} color="#0F172A" />
      </TouchableOpacity>

      <View style={tw`items-center flex-1 mx-2`}>
        <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 16, fontWeight: '900' }]}>
          Edit Partner Profile
        </Text>
        <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
          Manage KYC, vehicle, bank & personal data
        </Text>
      </View>

      <TouchableOpacity
        onPress={onSave}
        disabled={saving}
        style={tw`px-3 py-1.5 bg-emerald-600 rounded-xl shadow-sm`}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={tw`text-xs font-black text-white tracking-wide`}>SAVE</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
