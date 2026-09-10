import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

interface EditProfileBottomBarProps {
  bottomInset: number;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const EditProfileBottomBar: React.FC<EditProfileBottomBarProps> = ({
  bottomInset,
  saving,
  onClose,
  onSave,
}) => {
  return (
    <View
      style={[
        tw`px-5 py-3 border-t border-slate-100 bg-white flex-row gap-3 shadow-lg`,
        { paddingBottom: Math.max(bottomInset, 12) + 6 },
      ]}
    >
      <TouchableOpacity
        onPress={onClose}
        disabled={saving}
        style={tw`flex-1 py-3 rounded-2xl bg-slate-100 border border-slate-200 items-center justify-center`}
      >
        <Text style={tw`text-xs font-bold text-slate-600`}>CANCEL</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSave}
        disabled={saving}
        style={tw`flex-2 py-3 rounded-2xl bg-emerald-600 flex-row items-center justify-center shadow-md`}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="save-outline" size={16} color="#FFFFFF" style={tw`mr-1.5`} />
            <Text style={tw`text-xs font-black text-white tracking-wide`}>SAVE CHANGES</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};
