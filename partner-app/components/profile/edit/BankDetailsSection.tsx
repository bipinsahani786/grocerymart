import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

interface BankDetailsSectionProps {
  bankHolderName: string;
  setBankHolderName: (v: string) => void;
  bankAccountNumber: string;
  setBankAccountNumber: (v: string) => void;
  bankIfsc: string;
  setBankIfsc: (v: string) => void;
}

export const BankDetailsSection: React.FC<BankDetailsSectionProps> = ({
  bankHolderName,
  setBankHolderName,
  bankAccountNumber,
  setBankAccountNumber,
  bankIfsc,
  setBankIfsc,
}) => {
  return (
    <View style={tw`mb-5 pt-3 border-t border-slate-100`}>
      <View style={tw`flex-row items-center mb-3`}>
        <Ionicons name="business-outline" size={16} color="#0D9488" style={tw`mr-1.5`} />
        <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider`}>
          4. Bank Account & Daily Payouts
        </Text>
      </View>

      {/* Bank Holder Name */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>Account Holder Name</Text>
        <TextInput
          value={bankHolderName}
          onChangeText={setBankHolderName}
          placeholder="Name as per bank passbook"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50`}
        />
      </View>

      {/* Account Number */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>Bank Account Number</Text>
        <TextInput
          value={bankAccountNumber}
          onChangeText={(val) => setBankAccountNumber(val.replace(/\D/g, ''))}
          keyboardType="number-pad"
          placeholder="Enter 9-18 digit account number"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50`}
        />
      </View>

      {/* IFSC Code */}
      <View style={tw`mb-2`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>Bank IFSC Code</Text>
        <TextInput
          value={bankIfsc}
          onChangeText={(val) => setBankIfsc(val.toUpperCase())}
          autoCapitalize="characters"
          maxLength={11}
          placeholder="e.g. HDFC0001248"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50 uppercase`}
        />
      </View>
    </View>
  );
};
