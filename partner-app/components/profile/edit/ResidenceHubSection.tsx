import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

interface ResidenceHubSectionProps {
  address: string;
  setAddress: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  pincode: string;
  setPincode: (v: string) => void;
  allocatedHub: string;
  setAllocatedHub: (v: string) => void;
}

export const ResidenceHubSection: React.FC<ResidenceHubSectionProps> = ({
  address,
  setAddress,
  city,
  setCity,
  pincode,
  setPincode,
  allocatedHub,
  setAllocatedHub,
}) => {
  return (
    <View style={tw`mb-6 pt-3 border-t border-slate-100`}>
      <View style={tw`flex-row items-center mb-3`}>
        <Ionicons name="home-outline" size={16} color="#475569" style={tw`mr-1.5`} />
        <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider`}>
          5. Residence & Store Hub
        </Text>
      </View>

      {/* Address */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>Street Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="House / Flat No, Street name"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50`}
        />
      </View>

      {/* City & Pincode */}
      <View style={tw`flex-row gap-3 mb-3`}>
        <View style={tw`flex-1`}>
          <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>City</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Bengaluru"
            style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50`}
          />
        </View>

        <View style={tw`w-32`}>
          <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>Pincode</Text>
          <TextInput
            value={pincode}
            onChangeText={(val) => setPincode(val.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="560103"
            style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50`}
          />
        </View>
      </View>

      {/* Allocated Hub */}
      <View style={tw`mb-2`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>Allocated Store Hub</Text>
        <TextInput
          value={allocatedHub}
          onChangeText={setAllocatedHub}
          placeholder="e.g. Koramangala Dark Store #04"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50`}
        />
      </View>
    </View>
  );
};
