import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import tw from 'twrnc';

interface ProfileDetailsFormProps {
  user: any;
  name: string;
  setName: (text: string) => void;
  email: string;
  setEmail: (text: string) => void;
  dob: string;
  setDob: (text: string) => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  loading: boolean;
  onSave: () => void;
}

/**
 * Single Responsibility: Personal info editable form (Name, Email, Phone, DOB DatePicker, Save CTA).
 */
export const ProfileDetailsForm: React.FC<ProfileDetailsFormProps> = ({
  user,
  name,
  setName,
  email,
  setEmail,
  dob,
  setDob,
  isEditing,
  setIsEditing,
  loading,
  onSave,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDob(`${day}-${month}-${year}`);
    }
  };

  return (
    <View style={tw`p-4 rounded-3xl bg-white border border-slate-100 mb-4 shadow-sm`}>
      <View style={tw`flex-row justify-between items-center mb-3 pb-2 border-b border-slate-50`}>
        <View style={tw`flex-row items-center gap-2`}>
          <Ionicons name="person-circle-outline" size={18} color={theme.colors.primary} />
          <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider`}>
            Personal Information
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={[tw`text-[11px] font-bold`, { color: theme.colors.primary }]}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full Name */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-400 mb-1`}>Full Name</Text>
        <TextInput
          editable={isEditing}
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          placeholderTextColor="#94A3B8"
          style={[
            tw`px-3 py-2.5 rounded-xl border text-xs font-bold`,
            isEditing ? tw`bg-white border-slate-300 text-slate-900` : tw`bg-slate-50 border-slate-100 text-slate-700`,
          ]}
        />
      </View>

      {/* Email Address */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-400 mb-1`}>Email Address</Text>
        <TextInput
          editable={isEditing}
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          style={[
            tw`px-3 py-2.5 rounded-xl border text-xs font-bold`,
            isEditing ? tw`bg-white border-slate-300 text-slate-900` : tw`bg-slate-50 border-slate-100 text-slate-700`,
          ]}
        />
      </View>

      {/* Mobile Number */}
      <View style={tw`mb-3`}>
        <Text style={tw`text-[11px] font-bold text-slate-400 mb-1`}>Mobile Number</Text>
        <View style={tw`flex-row items-center px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100`}>
          <Text style={tw`flex-1 text-xs font-bold text-slate-600`}>
            {user?.phone || '+91 98765 43210'}
          </Text>
          <View style={tw`px-1.5 py-0.5 rounded-md bg-emerald-100`}>
            <Text style={tw`text-[9px] font-bold text-emerald-800`}>Verified</Text>
          </View>
        </View>
      </View>

      {/* Date of Birth */}
      <View style={tw`mb-1`}>
        <Text style={tw`text-[11px] font-bold text-slate-400 mb-1`}>Date of Birth</Text>
        <TouchableOpacity
          disabled={!isEditing}
          onPress={() => setShowDatePicker(true)}
          style={[
            tw`flex-row items-center justify-between px-3 py-2.5 rounded-xl border`,
            isEditing ? tw`bg-white border-slate-300` : tw`bg-slate-50 border-slate-100`,
          ]}
        >
          <Text style={[tw`text-xs font-bold`, dob ? tw`text-slate-800` : tw`text-slate-400`]}>
            {dob || 'DD-MM-YYYY'}
          </Text>
          {isEditing && <Ionicons name="calendar-outline" size={15} color="#94A3B8" />}
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {/* Save Button */}
      {isEditing && (
        <TouchableOpacity
          onPress={onSave}
          disabled={loading}
          style={[
            tw`w-full py-3 rounded-xl flex-row justify-center items-center gap-1.5 mt-3 shadow-xs`,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
              <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
                Save Updates
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};
