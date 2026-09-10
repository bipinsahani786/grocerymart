import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BLOOD_GROUPS } from './editProfile.constants';
import tw from 'twrnc';

interface PersonalInfoSectionProps {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  emergencyContact: string;
  setEmergencyContact: (v: string) => void;
  bloodGroup: string;
  setBloodGroup: (v: string) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  name,
  setName,
  email,
  setEmail,
  phone,
  emergencyContact,
  setEmergencyContact,
  bloodGroup,
  setBloodGroup,
}) => {
  return (
    <View style={tw`mb-5`}>
      <View style={tw`flex-row items-center mb-3`}>
        <Ionicons name="person-outline" size={16} color="#047857" style={tw`mr-1.5`} />
        <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider`}>
          1. Personal & Contact Details
        </Text>
      </View>

      {/* Full Name */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>Full Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter captain full legal name"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50`}
        />
      </View>

      {/* Email Address (Optional, Blank by Default) */}
      <View style={tw`mb-3`}>
        <View style={tw`flex-row justify-between items-center mb-1`}>
          <Text style={tw`text-[11px] font-bold text-slate-600`}>Email Address</Text>
          <Text style={tw`text-[10px] font-semibold text-slate-400`}>Optional</Text>
        </View>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Enter email address (leave blank if none)"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50`}
        />
        <Text style={tw`text-[9.5px] text-slate-400 mt-1`}>
          Kept blank by default. Only saved when entered by you.
        </Text>
      </View>

      {/* Phone Number (Verified, Read-Only) */}
      <View style={tw`mb-3`}>
        <View style={tw`flex-row justify-between items-center mb-1`}>
          <Text style={tw`text-[11px] font-bold text-slate-600`}>Registered Mobile</Text>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="shield-checkmark" size={12} color="#047857" style={tw`mr-1`} />
            <Text style={tw`text-[10px] font-extrabold text-emerald-700`}>VERIFIED</Text>
          </View>
        </View>
        <View style={tw`flex-row items-center border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-100`}>
          <Text style={tw`text-sm font-bold text-slate-500 mr-2`}>🇮🇳 +91</Text>
          <Text style={tw`text-sm font-black text-slate-700 flex-1`}>{phone}</Text>
          <Ionicons name="lock-closed" size={14} color="#94A3B8" />
        </View>
      </View>

      {/* Emergency Contact */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>Emergency Contact Number</Text>
        <TextInput
          value={emergencyContact}
          onChangeText={(val) => setEmergencyContact(val.replace(/\D/g, ''))}
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="10-digit emergency phone number"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50`}
        />
      </View>

      {/* Blood Group */}
      <View style={tw`mb-2`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1.5`}>Blood Group</Text>
        <View style={tw`flex-row flex-wrap gap-1.5`}>
          {BLOOD_GROUPS.map((bg) => {
            const isSelected = bloodGroup === bg;
            return (
              <TouchableOpacity
                key={bg}
                onPress={() => setBloodGroup(isSelected ? '' : bg)}
                style={[
                  tw`px-3 py-1.5 rounded-lg border`,
                  isSelected
                    ? tw`bg-emerald-600 border-emerald-600`
                    : tw`bg-slate-50 border-slate-200`,
                ]}
              >
                <Text
                  style={[
                    tw`text-xs font-extrabold`,
                    isSelected ? tw`text-white` : tw`text-slate-700`,
                  ]}
                >
                  {bg}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};
