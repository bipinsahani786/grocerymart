import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { useAuthContext } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import tw from 'twrnc';

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
const API_URL = `http://${localhost}:5000`;

export interface ToastType {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Profile() {
  const router = useRouter();
  const { user, accessToken, updateUser, logout } = useAuthContext();

  // If user is not logged in, redirect to login
  React.useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState(user?.dob || '');

  // UI states
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);

  const toastTimeoutRef = useRef<any>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (!message) return;
    setToast({ message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

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

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      triggerToast('Name is required.', 'error');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          dob: dob.trim() || null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        triggerToast('Profile updated successfully!', 'success');
        updateUser({
          ...user!,
          name: result.data.name,
          email: result.data.email,
          dob: result.data.dob,
          avatar: result.data.avatar,
        });
      } else {
        triggerToast(result.error || 'Failed to update profile.', 'error');
      }
    } catch {
      triggerToast('Network connection error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    router.replace('/login');
  };

  if (!user) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
        <StatusBar style="light" />

        {/* Top Header Section */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={tw`pt-12 pb-24 px-6 rounded-b-[40px] shadow-lg`}
        >
          <View style={tw`flex-row justify-between items-center mb-6`}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[tw`w-10 h-10 rounded-full justify-center items-center`, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
            >
              <Ionicons name="arrow-back" size={22} color={theme.colors.white} />
            </TouchableOpacity>
            <Text style={[tw`text-lg font-black`, { color: theme.colors.white }]}>My Profile</Text>
            <TouchableOpacity
              onPress={handleLogoutClick}
              style={[tw`w-10 h-10 rounded-full justify-center items-center`, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
            >
              <Ionicons name="log-out-outline" size={22} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          {/* Profile Card Summary */}
          <View style={tw`flex-row items-center mt-2`}>
            <View style={tw`relative`}>
              <View style={[tw`w-20 h-20 rounded-full border-4 border-white justify-center items-center shadow-md`, { backgroundColor: theme.colors.primaryLight }]}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={tw`w-full h-full rounded-full`} />
                ) : (
                  <Text style={tw`text-3xl`}>👤</Text>
                )}
              </View>
              <TouchableOpacity style={[tw`absolute bottom-0 right-0 w-7 h-7 rounded-full justify-center items-center border border-white shadow-sm`, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="camera" size={12} color={theme.colors.white} />
              </TouchableOpacity>
            </View>

            <View style={tw`ml-5 flex-1`}>
              <Text style={[tw`text-xl font-black`, { color: theme.colors.white }]}>{name || 'Valued Customer'}</Text>
              <Text style={[tw`text-xs font-semibold opacity-85 mt-0.5`, { color: theme.colors.white }]}>+91 {user.phone}</Text>
              <View style={[tw`flex-row items-center self-start px-2 py-0.5 rounded-full mt-2`, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                <Ionicons name="shield-checkmark" size={10} color={theme.colors.white} />
                <Text style={[tw`text-[9px] font-bold uppercase tracking-wider ml-1`, { color: theme.colors.white }]}>{user.role || 'customer'}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Input Form Fields */}
        <ScrollView
          style={tw`flex-1 -mt-10 px-6`}
          contentContainerStyle={tw`pb-32`}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[tw`p-6 rounded-3xl border shadow-sm`, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}>
            <Text style={[tw`text-xs font-black tracking-wider uppercase mb-5`, { color: theme.colors.textMuted }]}>Profile Details</Text>

            {/* Full Name field */}
            <Text style={[tw`text-xs font-bold mb-2`, { color: theme.colors.textLight }]}>Full Name</Text>
            <View style={[tw`flex-row items-center rounded-2xl h-14 px-4 border mb-5`, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <Ionicons name="person-outline" size={18} color={theme.colors.textMuted} style={tw`mr-2.5`} />
              <TextInput
                style={[tw`flex-1 h-full text-base font-semibold`, { color: theme.colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>

            {/* Email Address field */}
            <Text style={[tw`text-xs font-bold mb-2`, { color: theme.colors.textLight }]}>Email Address</Text>
            <View style={[tw`flex-row items-center rounded-2xl h-14 px-4 border mb-5`, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} style={tw`mr-2.5`} />
              <TextInput
                style={[tw`flex-1 h-full text-base font-semibold`, { color: theme.colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* DOB Picker field */}
            <Text style={[tw`text-xs font-bold mb-2`, { color: theme.colors.textLight }]}>Date of Birth</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
              style={[tw`flex-row items-center rounded-2xl h-14 px-4 border mb-5`, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
            >
              <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} style={tw`mr-2.5`} />
              <TextInput
                style={[tw`flex-1 h-full text-base font-semibold`, { color: theme.colors.text }]}
                value={dob}
                editable={false}
                pointerEvents="none"
                placeholder="Select date of birth"
                placeholderTextColor={theme.colors.textMuted}
              />
              <Ionicons name="calendar" size={18} color={theme.colors.primary} />
            </TouchableOpacity>

            {/* Phone field (Read Only) */}
            <Text style={[tw`text-xs font-bold mb-2`, { color: theme.colors.textLight }]}>Phone Number (Verifed)</Text>
            <View style={[tw`flex-row items-center rounded-2xl h-14 px-4 border mb-6 opacity-70`, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
              <Ionicons name="call-outline" size={18} color={theme.colors.textMuted} style={tw`mr-2.5`} />
              <Text style={[tw`text-base font-semibold flex-1`, { color: theme.colors.textLight }]}>+91 {user.phone}</Text>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[tw`flex-row h-14 rounded-2xl justify-center items-center shadow-md`, { backgroundColor: theme.colors.primary }]}
              activeOpacity={0.8}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Text style={[tw`font-extrabold text-base mr-2`, { color: theme.colors.white }]}>Save Changes</Text>
                  <Ionicons name="save-outline" size={16} color={theme.colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* DatePicker calendar popup */}
        {showDatePicker && (
          <DateTimePicker
            value={(() => {
              if (dob) {
                const parts = dob.split('-');
                if (parts.length === 3) {
                  const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                  if (!isNaN(d.getTime())) return d;
                }
              }
              return new Date(2000, 0, 1);
            })()}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        {/* Glassmorphic Toast Notification */}
        {toast && (
          <View style={[
            tw`absolute bottom-10 left-6 right-6 flex-row items-center p-4 rounded-xl border shadow-lg z-50`,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: toast.type === 'error' ? theme.colors.danger + '20' : theme.colors.primary + '20',
            }
          ]}>
            <Ionicons
              name={toast.type === 'error' ? 'close-circle' : 'checkmark-circle'}
              size={22}
              color={toast.type === 'error' ? theme.colors.danger : theme.colors.success}
            />
            <Text style={[tw`text-sm font-semibold ml-2.5 flex-1`, { color: theme.colors.text }]}>
              {toast.message}
            </Text>
            <TouchableOpacity onPress={() => setToast(null)} style={tw`p-0.5`}>
              <Ionicons name="close" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}
