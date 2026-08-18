import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { productService } from '../../services/product.service';
import { useCart } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface AddressItem {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface ProfileAddressesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileAddressesModal: React.FC<ProfileAddressesModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { setPincode, setSelectedAddress } = useCart();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Form inputs
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const { data: addresses = [], isLoading } = useQuery<AddressItem[]>({
    queryKey: ['customer-addresses'],
    queryFn: () => productService.fetchCustomerAddresses(),
    enabled: visible,
  });

  const addMutation = useMutation({
    mutationFn: (newAddr: { street: string; city: string; state: string; zipCode: string }) =>
      productService.addCustomerAddress(newAddr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      resetForm();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save address to backend.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { street: string; city: string; state: string; zipCode: string } }) =>
      productService.updateCustomerAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      resetForm();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update address.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteCustomerAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete address.');
    },
  });

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setIsFormOpen(true);
  };

  const handleStartEdit = (addr: AddressItem) => {
    setEditingId(addr.id);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setIsFormOpen(true);
  };

  const handleDetectLocation = async () => {
    try {
      setIsDetectingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions to auto-detect your address.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode && geocode.length > 0) {
        const addr = geocode[0];
        const isPlusCode = (val?: string | null) => !val || val.includes('+') || /^[A-Z0-9]{4,8}\+[A-Z0-9]{2,4}$/i.test(val.trim());

        const validParts: string[] = [];
        if (addr.name && !isPlusCode(addr.name) && isNaN(Number(addr.name))) {
          validParts.push(addr.name);
        }
        if (addr.street && !isPlusCode(addr.street) && !validParts.includes(addr.street)) {
          validParts.push(addr.street);
        }
        const locality = addr.district || addr.subregion;
        if (locality && !validParts.includes(locality)) {
          validParts.push(locality);
        }

        const detectedStreet = validParts.join(', ') || addr.name || addr.street || '';
        if (detectedStreet) setStreet(detectedStreet);
        if (addr.city) setCity(addr.city);
        if (addr.region) setState(addr.region);
        if (addr.postalCode) setZipCode(addr.postalCode);
      } else {
        Alert.alert('Notice', 'Could not reverse geocode your position. Please enter address manually.');
      }
    } catch (error) {
      console.error('Location detection error:', error);
      Alert.alert('Error', 'Failed to detect current location. Please verify GPS is enabled.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleDeleteConfirm = (id: string, streetName: string) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to remove "${streetName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
      ]
    );
  };

  const handleSubmit = () => {
    if (!street.trim()) {
      Alert.alert('Missing Field', 'Please enter your street address.');
      return;
    }
    if (!zipCode.trim()) {
      Alert.alert('Missing Field', 'Please enter your area pincode.');
      return;
    }

    const payload = {
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-slate-50`}>
        <StatusBar style="dark" />

        {/* ── Top Navigation Header ── */}
        <View
          style={[
            tw`bg-white px-5 pb-4 border-b border-slate-100 flex-row items-center justify-between shadow-xs`,
            { paddingTop: Math.max(insets.top, 14) + 6 },
          ]}
        >
          <View style={tw`flex-row items-center gap-3`}>
            <TouchableOpacity
              onPress={onClose}
              style={tw`w-10 h-10 rounded-full bg-slate-100 items-center justify-center`}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#334155" />
            </TouchableOpacity>

            <View>
              <Text style={tw`text-base font-black text-slate-800`}>My Addresses</Text>
              <Text style={tw`text-[10px] font-bold text-slate-400`}>
                {addresses.length} saved for your account
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={isFormOpen ? resetForm : handleStartAdd}
            activeOpacity={0.8}
            style={tw`flex-row items-center gap-1.5 bg-emerald-50 px-3.5 py-2 rounded-full border border-emerald-200 shadow-2xs`}
          >
            <Ionicons name={isFormOpen ? 'close' : 'add-circle'} size={16} color="#047857" />
            <Text style={tw`text-xs font-black text-emerald-800 uppercase tracking-wider`}>
              {isFormOpen ? 'Cancel' : 'Add New'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Full Page Scrollable Addresses List & Forms ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[tw`p-5`, { paddingBottom: 80 }]}
        >
          {/* Add / Edit Form Card */}
          {isFormOpen && (
            <View style={tw`p-5 rounded-3xl bg-white border border-emerald-200 mb-6 shadow-sm`}>
              <View style={tw`flex-row items-center gap-2 mb-3 pb-3 border-b border-slate-100`}>
                <View style={tw`w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center`}>
                  <Ionicons name={editingId ? 'pencil' : 'location'} size={16} color="#047857" />
                </View>
                <Text style={tw`text-sm font-black text-slate-800`}>
                  {editingId ? 'Edit Saved Address' : 'Add New Delivery Address'}
                </Text>
              </View>

              {/* ── GPS Auto-Detect Button ── */}
              <TouchableOpacity
                onPress={handleDetectLocation}
                disabled={isDetectingLocation}
                activeOpacity={0.8}
                style={[
                  tw`py-2.5 px-4 rounded-2xl flex-row items-center justify-center gap-2 mb-4 border shadow-2xs`,
                  {
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                  },
                ]}
              >
                {isDetectingLocation ? (
                  <ActivityIndicator size="small" color={theme.colors.primaryDark} />
                ) : (
                  <Ionicons name="navigate-circle" size={18} color={theme.colors.primaryDark} />
                )}
                <Text
                  style={[
                    tw`text-xs font-black uppercase tracking-wider`,
                    { color: theme.colors.primaryDark },
                  ]}
                >
                  {isDetectingLocation ? 'Detecting Location...' : 'Use Current GPS Location'}
                </Text>
              </TouchableOpacity>

              {/* Street Input */}
              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
                Street / Flat / House No / Colony
              </Text>
              <TextInput
                style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-800 mb-3.5 font-medium`}
                placeholder="Enter street, flat, or building name"
                placeholderTextColor="#94A3B8"
                value={street}
                onChangeText={setStreet}
              />

              {/* City & Pincode Grid */}
              <View style={tw`flex-row gap-3 mb-3.5`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
                    City
                  </Text>
                  <TextInput
                    style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-medium`}
                    placeholder="Enter city"
                    placeholderTextColor="#94A3B8"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
                    Pincode
                  </Text>
                  <TextInput
                    style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-medium`}
                    placeholder="6-digit PIN"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={6}
                    value={zipCode}
                    onChangeText={setZipCode}
                  />
                </View>
              </View>

              {/* State Input */}
              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
                State
              </Text>
              <TextInput
                style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 mb-5 font-medium`}
                placeholder="Enter state"
                placeholderTextColor="#94A3B8"
                value={state}
                onChangeText={setState}
              />

              {/* Action Buttons */}
              <View style={tw`flex-row gap-3`}>
                <TouchableOpacity
                  onPress={resetForm}
                  style={tw`flex-1 py-3 rounded-2xl bg-slate-100 items-center justify-center`}
                >
                  <Text style={tw`text-xs font-black text-slate-600`}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={addMutation.isPending || updateMutation.isPending}
                  style={[
                    tw`flex-2 py-3 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm`,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  {addMutation.isPending || updateMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                      <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
                        {editingId ? 'Save Changes' : 'Save Address'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Section Heading */}
          <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-3 px-1`}>
            Saved Delivery Locations
          </Text>

          {/* Addresses List Container */}
          {isLoading ? (
            <View style={tw`py-16 items-center justify-center`}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={tw`text-xs font-bold text-slate-400 mt-3`}>Loading addresses from database...</Text>
            </View>
          ) : addresses.length === 0 ? (
            <View style={tw`py-16 items-center justify-center bg-white rounded-3xl border border-slate-100 p-6`}>
              <View style={tw`w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-3`}>
                <Ionicons name="location-outline" size={32} color="#059669" />
              </View>
              <Text style={tw`text-sm font-black text-slate-800 mb-1`}>No saved addresses yet</Text>
              <Text style={tw`text-xs text-slate-400 text-center mb-5`}>
                Add your home or office address to enable 15-min express delivery
              </Text>
              <TouchableOpacity
                onPress={handleStartAdd}
                style={[tw`px-6 py-3 rounded-2xl shadow-sm`, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>+ Add Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.map((addr, index) => (
              <View
                key={addr.id || index}
                style={tw`p-4.5 rounded-3xl bg-white border border-slate-100 shadow-sm mb-3.5`}
              >
                <View style={tw`flex-row items-start justify-between mb-3`}>
                  <View style={tw`flex-row items-center gap-3 flex-1 mr-2`}>
                    <View style={tw`w-10 h-10 rounded-2xl bg-purple-50 items-center justify-center`}>
                      <Ionicons name="location" size={20} color="#7C3AED" />
                    </View>
                    <View style={tw`flex-1`}>
                      <View style={tw`flex-row items-center gap-2 mb-0.5`}>
                        <Text style={tw`text-sm font-black text-slate-800`}>
                          Address #{index + 1}
                        </Text>
                        {index === 0 && (
                          <View style={tw`px-2 py-0.5 rounded-md bg-emerald-100`}>
                            <Text style={tw`text-[9px] font-black text-emerald-800 uppercase`}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={tw`text-[11px] font-bold text-slate-400`}>
                        PIN: {addr.zipCode}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Street & Location Detail */}
                <View style={tw`bg-slate-50 p-3 rounded-2xl mb-3.5 border border-slate-100/80`}>
                  <Text style={tw`text-xs font-black text-slate-800 mb-1 leading-5`}>
                    {addr.street}
                  </Text>
                  <Text style={tw`text-[11px] font-medium text-slate-500`}>
                    {addr.city}, {addr.state} - {addr.zipCode}
                  </Text>
                </View>

                {/* Action Buttons: Deliver Here, Edit & Delete */}
                <View style={tw`flex-row items-center justify-between pt-2 border-t border-slate-100`}>
                  <TouchableOpacity
                    onPress={() => {
                      setPincode(addr.zipCode);
                      setSelectedAddress(addr.street);
                      Alert.alert('Delivery Address Selected', `Delivering to: ${addr.street}`);
                      onClose();
                    }}
                    activeOpacity={0.8}
                    style={tw`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600`}
                  >
                    <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
                    <Text style={tw`text-[10px] font-black text-white uppercase tracking-wider`}>
                      Deliver Here
                    </Text>
                  </TouchableOpacity>

                  <View style={tw`flex-row items-center gap-2`}>
                    <TouchableOpacity
                      onPress={() => handleStartEdit(addr)}
                      activeOpacity={0.8}
                      style={tw`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200`}
                    >
                      <Ionicons name="pencil" size={13} color="#475569" />
                      <Text style={tw`text-[10px] font-black text-slate-700 uppercase tracking-wider`}>
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeleteConfirm(addr.id, addr.street)}
                      activeOpacity={0.8}
                      style={tw`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200`}
                    >
                      <Ionicons name="trash" size={13} color="#E11D48" />
                      <Text style={tw`text-[10px] font-black text-rose-700 uppercase tracking-wider`}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};
