import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VEHICLE_TYPES } from './editProfile.constants';
import tw from 'twrnc';

interface VehicleInfoSectionProps {
  vehicleType: string;
  setVehicleType: (v: string) => void;
  vehicleModel: string;
  setVehicleModel: (v: string) => void;
  rcNumber: string;
  setRcNumber: (v: string) => void;
}

export const VehicleInfoSection: React.FC<VehicleInfoSectionProps> = ({
  vehicleType,
  setVehicleType,
  vehicleModel,
  setVehicleModel,
  rcNumber,
  setRcNumber,
}) => {
  return (
    <View style={tw`mb-5 pt-3 border-t border-slate-100`}>
      <View style={tw`flex-row items-center mb-3`}>
        <Ionicons name="bicycle-outline" size={16} color="#2563EB" style={tw`mr-1.5`} />
        <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider`}>
          2. Vehicle Information
        </Text>
      </View>

      {/* Vehicle Type Pills */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1.5`}>Vehicle Type</Text>
        <View style={tw`flex-row flex-wrap gap-2`}>
          {VEHICLE_TYPES.map((v) => {
            const isSelected = vehicleType === v.key;
            return (
              <TouchableOpacity
                key={v.key}
                onPress={() => setVehicleType(v.key)}
                style={[
                  tw`px-3 py-2 rounded-xl border flex-row items-center`,
                  isSelected
                    ? tw`bg-blue-50 border-blue-500`
                    : tw`bg-slate-50 border-slate-200`,
                ]}
              >
                <Text
                  style={[
                    tw`text-xs font-extrabold`,
                    isSelected ? tw`text-blue-700` : tw`text-slate-700`,
                  ]}
                >
                  {v.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Vehicle Model */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>Vehicle Model & Make</Text>
        <TextInput
          value={vehicleModel}
          onChangeText={setVehicleModel}
          placeholder="e.g. Honda Activa 6G, Ather 450X"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50`}
        />
      </View>

      {/* Vehicle RC Number */}
      <View style={tw`mb-2`}>
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-1`}>Vehicle RC Number</Text>
        <TextInput
          value={rcNumber}
          onChangeText={(val) => setRcNumber(val.toUpperCase())}
          autoCapitalize="characters"
          placeholder="e.g. KA01EQ4921"
          style={tw`border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 bg-slate-50 uppercase`}
        />
      </View>
    </View>
  );
};
