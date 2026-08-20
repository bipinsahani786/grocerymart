import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export const TrustBadgesSection: React.FC = () => {
  const perks = [
    {
      icon: 'flash',
      color: '#EAB308',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      title: '10-Min Fast Delivery',
      desc: 'Hyper-local rider network',
    },
    {
      icon: 'shield-checkmark',
      color: '#059669',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      title: '100% Quality Assurance',
      desc: 'Triple-stage hygiene check',
    },
    {
      icon: 'snow',
      color: '#0284C7',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      title: 'Cold-Chain Transit',
      desc: 'Insulated thermal boxes',
    },
    {
      icon: 'refresh-circle',
      color: '#7C3AED',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      title: 'Doorstep Instant Return',
      desc: 'No questions asked refund',
    },
  ];

  return (
    <View style={tw`mb-6 px-4`}>
      <View style={tw`bg-slate-50 border border-slate-200/80 rounded-3xl p-4 shadow-sm`}>
        <Text style={tw`text-[11px] font-black text-slate-700 uppercase tracking-wider mb-3 text-center`}>
          🌟 The GroceryMart Promise
        </Text>

        <View style={tw`flex-row flex-wrap justify-between gap-y-3`}>
          {perks.map((p, idx) => (
            <View
              key={idx}
              style={[
                tw`w-[48.5%] p-3 rounded-2xl border bg-white flex-row items-center gap-2.5`,
                tw`${p.borderColor}`,
              ]}
            >
              <View style={[tw`w-8 h-8 rounded-xl items-center justify-center`, tw`${p.bgColor}`]}>
                <Ionicons name={p.icon as any} size={16} color={p.color} />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-[10px] font-black text-slate-800 leading-3.5`} numberOfLines={1}>
                  {p.title}
                </Text>
                <Text style={tw`text-[8.5px] font-bold text-slate-400 mt-0.5`} numberOfLines={1}>
                  {p.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
