import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

interface KycDocsSectionProps {
  kycStatus?: string;
  dlNumber: string;
  setDlNumber: (v: string) => void;
  dlExpiry: string;
  setDlExpiry: (v: string) => void;
  aadhaarNumber: string;
  setAadhaarNumber: (v: string) => void;
  panNumber: string;
  setPanNumber: (v: string) => void;
}

export const KycDocsSection: React.FC<KycDocsSectionProps> = ({
  kycStatus,
  dlNumber,
  setDlNumber,
  dlExpiry,
  setDlExpiry,
  aadhaarNumber,
  setAadhaarNumber,
  panNumber,
  setPanNumber,
}) => {
  return (
    <View style={tw`mb-5 pt-3 border-t border-slate-100`}>
      <View style={tw`flex-row justify-between items-center mb-3`}>
        <View style={tw`flex-row items-center`}>
          <Ionicons name="document-text-outline" size={16} color="#047857" style={tw`mr-1.5`} />
          <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider`}>
            3. KYC & Government Documents
          </Text>
        </View>
        <View
          style={[
            tw`px-2 py-0.5 rounded-full border`,
            kycStatus === 'APPROVED'
              ? tw`bg-emerald-50 border-emerald-300`
              : tw`bg-amber-50 border-amber-300`,
          ]}
        >
          <Text
            style={[
              tw`text-[9.5px] font-black`,
              kycStatus === 'APPROVED' ? tw`text-emerald-700` : tw`text-amber-700`,
            ]}
          >
            {kycStatus || 'PENDING'}
          </Text>
        </View>
      </View>

      {/* Driving License */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>Driving License Number (DL)</Text>
        <TextInput
          value={dlNumber}
          onChangeText={(val) => setDlNumber(val.toUpperCase())}
          autoCapitalize="characters"
          placeholder="e.g. KA0120220048210"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50 uppercase`}
        />
      </View>

      {/* DL Expiry */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>DL Expiry Date (MM/YYYY)</Text>
        <TextInput
          value={dlExpiry}
          onChangeText={setDlExpiry}
          placeholder="e.g. 12/2028"
          maxLength={7}
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50`}
        />
      </View>

      {/* Aadhaar Number */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>Aadhaar Card Number (12 Digits)</Text>
        <TextInput
          value={aadhaarNumber}
          onChangeText={(val) => setAadhaarNumber(val.replace(/\D/g, ''))}
          keyboardType="number-pad"
          maxLength={12}
          placeholder="12-digit Aadhaar number"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50`}
        />
      </View>

      {/* PAN Card */}
      <View style={tw`mb-2`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>PAN Card Number</Text>
        <TextInput
          value={panNumber}
          onChangeText={(val) => setPanNumber(val.toUpperCase())}
          autoCapitalize="characters"
          maxLength={10}
          placeholder="e.g. ABCDE1234F"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50 uppercase`}
        />
      </View>
    </View>
  );
};
