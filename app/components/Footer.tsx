import React from 'react';
import { View, Text, Image } from 'react-native';
import { theme } from '../constants/theme';
import tw from 'twrnc';

/**
 * Single Responsibility: Minimal, aesthetic, compact footer displaying the original logo and brand title.
 */
export const Footer: React.FC = () => {
  return (
    <View style={tw`items-center justify-center py-6 px-4 mt-4 mb-2`}>
      {/* ── Brand Logo & Title ── */}
      <View style={tw`flex-row items-center gap-2 mb-1.5`}>
        <Image
          source={require('../assets/images/zytrixon.png')}
          style={tw`w-7 h-7 rounded-lg`}
          resizeMode="contain"
        />
        <Text style={[tw`text-sm font-black tracking-tight`, { color: theme.colors.text }]}>
          Grocery Mart
        </Text>
      </View>

      {/* ── Short Tagline / Trust Highlights ── */}
      <Text style={[tw`text-[10px] font-semibold text-slate-400 text-center mb-1.5`]}>
        🌱 100% Fresh Organic • ⚡ Fast Delivery • 🔒 Secure Pay
      </Text>

      {/* ── Short Copyright Notice ── */}
      <Text style={[tw`text-[9px] font-medium text-slate-300 text-center`]}>
        © 2026 Grocery Mart. All rights reserved.
      </Text>
    </View>
  );
};
