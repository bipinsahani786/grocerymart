import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import tw from 'twrnc';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const steps = [
    {
      title: 'Personal & Contact Information',
      desc: 'Mobile number, name, residential address verified',
      icon: 'person-circle',
      status: 'DONE',
    },
    {
      title: 'Driving License (DL) & RC Verification',
      desc: 'Smart card verified via DigiLocker Government database',
      icon: 'card',
      status: 'DONE',
    },
    {
      title: 'Commercial Insurance & Vehicle Inspection',
      desc: 'Electric Bike safety check cleared at hub',
      icon: 'shield-checkmark',
      status: 'DONE',
    },
    {
      title: 'Bank Account & Daily Payout Mandate',
      desc: 'HDFC Bank account active for instant settlements',
      icon: 'wallet',
      status: 'DONE',
    },
    {
      title: 'Dark Store Hub Allocation',
      desc: 'Assigned to Koramangala Express Hub #04',
      icon: 'storefront',
      status: 'DONE',
    },
  ];

  return (
    <View style={[tw`flex-1`, { backgroundColor: Colors.background, paddingTop: insets.top }]}>
      {/* Top Header */}
      <View
        style={[
          tw`flex-row items-center px-5 py-4 border-b`,
          { backgroundColor: Colors.surface, borderBottomColor: Colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={tw`mr-3`}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[tw`text-lg font-extrabold`, { color: Colors.text }]}>
          Partner Onboarding Status
        </Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-5 pb-10`}>
        {/* Approved Banner */}
        <View
          style={[
            tw`border rounded-2xl p-5 items-center mb-6`,
            { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
          ]}
        >
          <View style={tw`mb-2`}>
            <Ionicons name="checkmark-circle" size={32} color={Colors.primary} />
          </View>
          <Text style={[tw`text-xl font-black`, { color: Colors.text }]}>Application Approved! 🚀</Text>
          <Text style={[tw`text-xs text-center mt-1.5 leading-5`, { color: Colors.textSecondary }]}>
            All your partner credentials and KYC documents have been successfully verified. You are ready to start delivering and earning!
          </Text>
        </View>

        {/* Steps List */}
        <Text style={[tw`text-xs font-bold mb-3 tracking-wider`, { color: Colors.textSecondary }]}>
          VERIFICATION CHECKLIST (5/5 COMPLETED)
        </Text>
        <View style={tw`gap-3 mb-7`}>
          {steps.map((step, idx) => (
            <View
              key={idx}
              style={[
                tw`flex-row items-center border rounded-xl p-3.5 shadow-sm`,
                { backgroundColor: Colors.surface, borderColor: Colors.border },
              ]}
            >
              <View
                style={[
                  tw`w-9 h-9 rounded-full justify-center items-center mr-3`,
                  { backgroundColor: Colors.primaryBg },
                ]}
              >
                <Ionicons name={step.icon as any} size={20} color={Colors.primary} />
              </View>
              <View style={tw`flex-1 pr-2`}>
                <Text style={[tw`text-sm font-bold`, { color: Colors.text }]}>{step.title}</Text>
                <Text style={[tw`text-xs mt-0.5`, { color: Colors.textSecondary }]}>{step.desc}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
            </View>
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.replace('/home')}
          style={[
            tw`rounded-xl py-3.5 flex-row justify-center items-center shadow-md`,
            { backgroundColor: Colors.primary },
          ]}
        >
          <Text style={[tw`text-sm font-black mr-2 tracking-wide`, { color: Colors.white }]}>
            ENTER PARTNER DASHBOARD
          </Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
