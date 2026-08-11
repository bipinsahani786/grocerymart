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
  const [isEditing, setIsEditing] = useState(false);

  // Fetch latest profile on mount
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) return;
      try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        const result = await response.json();
        if (response.ok && result.success && result.data) {
          updateUser(result.data);
          setName(result.data.name || '');
          setEmail(result.data.email || '');
          setDob(result.data.dob || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile details:', err);
      }
    };

    fetchProfile();
  }, [accessToken]);

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
        setIsEditing(false);
        updateUser({
          ...user!,
          name: result.data.name,
          email: result.data.email,
          dob: result.data.dob,
          avatar: result.data.avatar,
        });
      } else {
        const errorMsg = result.error || result.message || 'Failed to update profile.';
        triggerToast(errorMsg, 'error');
      }
    } catch {
      const connError = 'Network connection error. Please check your internet connection.';
      triggerToast(connError, 'error');
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
      <View style={[tw`flex-1`, { backgroundColor: theme.colors.white }]}>
        <StatusBar style="light" />

        {/* Top Header Section */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={tw`pt-12 pb-28 px-6 rounded-b-[40px] shadow-lg`}
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
              <View style={[tw`w-20 h-20 rounded-full border-4 border-white justify-center items-center shadow-lg`, { backgroundColor: theme.colors.primaryLight }]}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={tw`w-full h-full rounded-full`} />
                ) : (
                  <Text style={tw`text-3xl`}>👤</Text>
                )}
              </View>
              <TouchableOpacity style={[tw`absolute bottom-0 right-0 w-7 h-7 rounded-full justify-center items-center border border-white shadow-md`, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="camera" size={12} color={theme.colors.white} />
              </TouchableOpacity>
            </View>

            <View style={tw`ml-5 flex-1`}>
              <Text style={[tw`text-xl font-black`, { color: theme.colors.white }]}>{name || 'Valued Customer'}</Text>
              <Text style={[tw`text-xs font-semibold opacity-90 mt-0.5`, { color: theme.colors.white }]}>+91 {user.phone}</Text>
              <View style={[tw`flex-row items-center self-start px-2 py-0.5 rounded-full mt-2`, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                <Ionicons name="shield-checkmark" size={10} color={theme.colors.white} />
                <Text style={[tw`text-[9px] font-bold uppercase tracking-wider ml-1`, { color: theme.colors.white }]}>{user.role || 'customer'}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Dashboard Statistics Section (Floating Card style) */}
        <View style={tw`px-6 -mt-16 z-10`}>
          <View style={[tw`flex-row justify-between p-4 rounded-3xl border shadow-md`, { backgroundColor: theme.colors.white, borderColor: '#E5E7EB' }]}>
            <View style={tw`items-center flex-1 border-r border-gray-100`}>
              <View style={[tw`w-10 h-10 rounded-full justify-center items-center mb-1.5`, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="wallet" size={20} color={theme.colors.primary} />
              </View>
              <Text style={[tw`text-xs font-semibold text-gray-400`]}>Wallet</Text>
              <Text style={[tw`text-sm font-bold mt-0.5`, { color: theme.colors.text }]}>₹{(user.walletBalance ?? 0).toFixed(2)}</Text>
            </View>

            <View style={tw`items-center flex-1 border-r border-gray-100`}>
              <View style={[tw`w-10 h-10 rounded-full justify-center items-center mb-1.5`, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="star" size={20} color="#F59E0B" />
              </View>
              <Text style={[tw`text-xs font-semibold text-gray-400`]}>Loyalty</Text>
              <Text style={[tw`text-sm font-bold mt-0.5`, { color: theme.colors.text }]}>{user.loyaltyPoints ?? 0} pts</Text>
            </View>

            <View style={tw`items-center flex-1`}>
              <View style={[tw`w-10 h-10 rounded-full justify-center items-center mb-1.5`, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="basket" size={20} color="#3B82F6" />
              </View>
              <Text style={[tw`text-xs font-semibold text-gray-400`]}>Orders</Text>
              <Text style={[tw`text-sm font-bold mt-0.5`, { color: theme.colors.text }]}>{user.totalOrders ?? 0}</Text>
            </View>
          </View>
        </View>

        {/* Form and Quick Actions */}
        <ScrollView
          style={tw`flex-1 px-6`}
          contentContainerStyle={tw`pt-6 pb-32`}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Personal Details Section (Borderless settings-style stack) */}
          <View style={tw`mb-8`}>
            <View style={tw`flex-row justify-between items-center pb-2 mb-2 border-b border-gray-100`}>
              <Text style={[tw`text-xs font-black tracking-wider uppercase`, { color: theme.colors.textMuted }]}>Personal Details</Text>
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                activeOpacity={0.8}
                style={[
                  tw`flex-row items-center px-3.5 py-1.5 rounded-xl border`,
                  {
                    backgroundColor: 'transparent',
                    borderColor: isEditing ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                  }
                ]}
              >
                <Ionicons
                  name={isEditing ? 'close-circle-outline' : 'create-outline'}
                  size={14}
                  color={isEditing ? theme.colors.danger : theme.colors.primary}
                  style={tw`mr-1`}
                />
                <Text style={[tw`text-[11px] font-black uppercase tracking-wider`, { color: isEditing ? theme.colors.danger : theme.colors.primary }]}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Full Name field */}
            <View style={tw`flex-row items-center py-3 border-b border-gray-100`}>
              <View style={[tw`w-9 h-9 rounded-xl justify-center items-center mr-3.5`, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="person-outline" size={16} color={theme.colors.primary} />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[tw`text-[10px] font-black text-gray-400 uppercase tracking-wider`]}>Full Name</Text>
                <TextInput
                  style={[tw`text-base font-bold text-gray-800 mt-0.5 p-0`, { minHeight: 22 }, !isEditing && { color: theme.colors.textLight }]}
                  value={name}
                  onChangeText={setName}
                  editable={isEditing}
                  placeholder="Your full name"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            </View>

            {/* Email Address field */}
            <View style={tw`flex-row items-center py-3 border-b border-gray-100`}>
              <View style={[tw`w-9 h-9 rounded-xl justify-center items-center mr-3.5`, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="mail-outline" size={16} color="#3B82F6" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[tw`text-[10px] font-black text-gray-400 uppercase tracking-wider`]}>Email Address</Text>
                <TextInput
                  style={[tw`text-base font-bold text-gray-800 mt-0.5 p-0`, { minHeight: 22 }, !isEditing && { color: theme.colors.textLight }]}
                  value={email}
                  onChangeText={setEmail}
                  editable={isEditing}
                  placeholder="example@email.com"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* DOB Picker field */}
            <TouchableOpacity
              onPress={() => isEditing && setShowDatePicker(true)}
              activeOpacity={0.7}
              disabled={!isEditing}
              style={tw`flex-row items-center py-3 border-b border-gray-100`}
            >
              <View style={[tw`w-9 h-9 rounded-xl justify-center items-center mr-3.5`, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="calendar-outline" size={16} color="#F59E0B" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[tw`text-[10px] font-black text-gray-400 uppercase tracking-wider`]}>Date of Birth</Text>
                <Text style={[tw`text-base font-bold text-gray-800 mt-0.5`, !isEditing && { color: theme.colors.textLight }]}>
                  {dob || 'Select date of birth'}
                </Text>
              </View>
              {isEditing && <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
            </TouchableOpacity>

            {/* Phone field (Read Only) */}
            <View style={tw`flex-row items-center py-3 border-b border-gray-100 opacity-80`}>
              <View style={[tw`w-9 h-9 rounded-xl justify-center items-center mr-3.5`, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="call-outline" size={16} color={theme.colors.textMuted} />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[tw`text-[10px] font-black text-gray-400 uppercase tracking-wider`]}>Phone Number</Text>
                <Text style={[tw`text-base font-bold text-gray-700 mt-0.5`]}>+91 {user.phone}</Text>
              </View>
              <View style={[tw`flex-row items-center px-2 py-0.5 rounded-full`, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="checkmark-circle" size={10} color={theme.colors.success} style={tw`mr-1`} />
                <Text style={[tw`text-[8px] font-extrabold text-emerald-800 uppercase`]}>Verified</Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          {isEditing && (
            <TouchableOpacity
              style={tw`mb-8 shadow-md rounded-2xl overflow-hidden`}
              activeOpacity={0.85}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={tw`flex-row h-13 justify-center items-center px-6`}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.white} style={tw`mr-2`} />
                    <Text style={[tw`font-extrabold text-base tracking-wide`, { color: theme.colors.white }]}>
                      Confirm & Save Details
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Preferences & Account Section (Borderless settings-style stack) */}
          <View style={tw`mb-8`}>
            <View style={tw`pb-2 mb-2 border-b border-gray-100`}>
              <Text style={[tw`text-xs font-black tracking-wider uppercase`, { color: theme.colors.textMuted }]}>Preferences & Account</Text>
            </View>

            {/* List Row Item 1 */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => triggerToast('Address Book screen is coming soon!', 'info')}
              style={tw`flex-row items-center justify-between py-3.5 border-b border-gray-100`}
            >
              <View style={tw`flex-row items-center`}>
                <View style={[tw`w-9 h-9 rounded-xl justify-center items-center mr-3.5`, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="location-outline" size={16} color="#F59E0B" />
                </View>
                <Text style={[tw`text-sm font-bold text-gray-700`]}>My Addresses</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* List Row Item 2 */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => triggerToast('Order History screen is coming soon!', 'info')}
              style={tw`flex-row items-center justify-between py-3.5 border-b border-gray-100`}
            >
              <View style={tw`flex-row items-center`}>
                <View style={[tw`w-9 h-9 rounded-xl justify-center items-center mr-3.5`, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="receipt-outline" size={16} color="#3B82F6" />
                </View>
                <Text style={[tw`text-sm font-bold text-gray-700`]}>Order History</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* List Row Item 3 */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => triggerToast('Help center is offline. Please call support.', 'info')}
              style={tw`flex-row items-center justify-between py-3.5 border-b border-gray-100`}
            >
              <View style={tw`flex-row items-center`}>
                <View style={[tw`w-9 h-9 rounded-xl justify-center items-center mr-3.5`, { backgroundColor: '#E1F5FE' }]}>
                  <Ionicons name="chatbox-ellipses-outline" size={16} color="#0288D1" />
                </View>
                <Text style={[tw`text-sm font-bold text-gray-700`]}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* List Row Item 4 - Logout option inside actions */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogoutClick}
              style={tw`flex-row items-center justify-between py-3.5`}
            >
              <View style={tw`flex-row items-center`}>
                <View style={[tw`w-9 h-9 rounded-xl justify-center items-center mr-3.5`, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="log-out-outline" size={16} color={theme.colors.danger} />
                </View>
                <Text style={[tw`text-sm font-bold text-red-600`]}>Log Out Account</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#FCA5A5" />
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
