import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsContext } from '../../context/SettingsContext';
import tw from 'twrnc';

export const SettingsToast: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { toastMessage } = useSettingsContext();

  if (!toastMessage) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        tw`absolute left-4 right-4 z-50 items-center justify-center`,
        { top: Math.max(insets.top, 16) + 48 },
      ]}
    >
      <View style={tw`bg-slate-900/95 border border-emerald-500/80 px-4 py-2.5 rounded-2xl shadow-xl flex-row items-center gap-2 max-w-[92%]`}>
        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
        <Text style={tw`text-white text-xs font-extrabold text-center flex-1`}>
          {toastMessage}
        </Text>
      </View>
    </View>
  );
};
