import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
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

type AddressTag = 'Home' | 'Work' | 'Other';

export const ProfileAddressesModal: React.FC<ProfileAddressesModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { setPincode, setSelectedAddress, selectedAddress } = useCart();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedTag, setSelectedTag] = useState<AddressTag>('Home');

  // Form inputs
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    if (visible) {
      RNStatusBar.setBarStyle('light-content', true);
      if (Platform.OS === 'android') {
        RNStatusBar.setBackgroundColor('transparent', true);
        RNStatusBar.setTranslucent(true);
      }
    }
  }, [visible]);

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
      Alert.alert('Error', 'Failed to save address!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { street?: string; city?: string; state?: string; zipCode?: string } }) =>
      productService.updateCustomerAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      resetForm();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update address!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteCustomerAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete address!');
    },
  });

  const resetForm = () => {
    setHouseNo('');
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setSelectedTag('Home');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleStartEdit = (item: AddressItem) => {
    setEditingId(item.id);
    const streetParts = item.street.split(' - ');
    if (streetParts.length > 1) {
      setHouseNo(streetParts[0]);
      setStreet(streetParts.slice(1).join(' - '));
    } else {
      setHouseNo('');
      setStreet(item.street);
    }
    setCity(item.city);
    setState(item.state);
    setZipCode(item.zipCode);
    setIsFormOpen(true);
  };

  const handleSelectAddress = (addr: AddressItem) => {
    setPincode(addr.zipCode);
    setSelectedAddress(addr.street);
    Alert.alert('Delivery Location Updated', `Delivering to: ${addr.street}`, [
      { text: 'OK', onPress: onClose },
    ]);
  };

  const sanitizeLocationText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[A-Z0-9]{2,8}\+[A-Z0-9]{0,6}(\s*,\s*|\s*)/gi, '') // Remove Plus Codes like H33P+72, H33P+, etc.
      .replace(/\b(India|Bharat)\b/gi, '')
      .replace(/\b\d{6}\b/g, '') // Remove standalone 6-digit postal code
      .replace(/^[\s,]+|[\s,]+$/g, '') // Trim leading/trailing commas and whitespace
      .replace(/\s*,\s*,+/g, ', ') // Remove duplicate commas like ,,
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  const handleDetectCurrentLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant location permission to detect your address.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [addr] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (addr) {
        let detectedStreet = '';

        // 1. If formattedAddress is available, sanitize and use the clean location description
        if (addr.formattedAddress) {
          const cleaned = sanitizeLocationText(addr.formattedAddress);
          const parts = cleaned
            .split(',')
            .map((p) => p.trim())
            .filter((p) => p && !p.includes('+') && !p.match(/^(India|Bharat)$/i) && !p.match(/^\d{6}$/));

          if (parts.length > 0) {
            detectedStreet = parts.slice(0, Math.min(parts.length, 3)).join(', ');
          }
        }

        // 2. Fallback to combining detailed sub-fields if formattedAddress is unavailable or generic
        const isGeneric = (s?: string | null) =>
          !s || s.includes('+') || /^(road|street|gali|lane|unnamed road)$/i.test(s.trim());

        if (!detectedStreet || isGeneric(detectedStreet)) {
          const validParts: string[] = [];
          if (addr.name && !isGeneric(addr.name) && isNaN(Number(addr.name))) {
            const cleanName = sanitizeLocationText(addr.name);
            if (cleanName) validParts.push(cleanName);
          }
          if (addr.street && !isGeneric(addr.street) && !validParts.includes(addr.street.trim())) {
            const cleanStreet = sanitizeLocationText(addr.street);
            if (cleanStreet && !validParts.includes(cleanStreet)) validParts.push(cleanStreet);
          }
          const locality = addr.district || addr.subregion;
          if (locality && !isGeneric(locality)) {
            const cleanLocality = sanitizeLocationText(locality);
            if (cleanLocality && !validParts.includes(cleanLocality)) {
              validParts.push(cleanLocality);
            }
          }
          detectedStreet = validParts.join(', ') || sanitizeLocationText(addr.formattedAddress || '') || '';
        }

        detectedStreet = sanitizeLocationText(detectedStreet);

        if (detectedStreet) setStreet(detectedStreet);
        if (addr.streetNumber && !addr.streetNumber.includes('+')) setHouseNo(addr.streetNumber);
        if (addr.city) setCity(addr.city.replace(/\+/g, '').trim());
        if (addr.region) setState(addr.region.replace(/\+/g, '').trim());
        if (addr.postalCode && /^\d{6}$/.test(addr.postalCode.trim())) setZipCode(addr.postalCode.trim());
        setIsFormOpen(true);
      } else {
        Alert.alert('Notice', 'Could not reverse geocode your coordinates. Please enter manually.');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to detect location. Please check GPS permissions.');
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
      Alert.alert('Missing Field', 'Please enter your street / building address.');
      return;
    }
    if (!zipCode.trim() || zipCode.length < 6) {
      Alert.alert('Missing Field', 'Please enter a valid 6-digit area pincode.');
      return;
    }

    const fullStreet = houseNo.trim() ? `${houseNo.trim()} - ${street.trim()}` : street.trim();

    const payload = {
      street: fullStreet,
      city: city.trim() || 'Local City',
      state: state.trim() || 'State',
      zipCode: zipCode.trim(),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const getTagIcon = (tag: string) => {
    if (tag.toLowerCase().includes('work') || tag.toLowerCase().includes('office')) return 'business';
    if (tag.toLowerCase().includes('home')) return 'home';
    return 'location';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      hardwareAccelerated={true}
      onShow={() => {
        RNStatusBar.setBarStyle('light-content', true);
        if (Platform.OS === 'android') {
          RNStatusBar.setBackgroundColor('transparent', true);
          RNStatusBar.setTranslucent(true);
        }
      }}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-slate-50`}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        {Platform.OS === 'android' && (
          <RNStatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        )}

        {/* ── 1. Top Emerald Navigation Header ── */}
        <LinearGradient
          colors={['#064E3B', '#047857', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            tw`pb-4.5 px-5 flex-row items-center justify-between`,
            { paddingTop: Math.max(insets.top, 14) + 8 },
          ]}
        >
          <View style={tw`flex-row items-center gap-3`}>
            <TouchableOpacity
              onPress={onClose}
              style={tw`w-9 h-9 rounded-full bg-white/20 border border-white/20 items-center justify-center`}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={19} color="#FFFFFF" />
            </TouchableOpacity>

            <View>
              <Text style={tw`text-lg font-black text-white tracking-tight`}>My Addresses</Text>
              <Text style={tw`text-[11px] font-bold text-emerald-100 mt-0.5`}>
                {addresses.length} {addresses.length === 1 ? 'address saved' : 'addresses saved'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={isFormOpen ? resetForm : handleStartAdd}
            activeOpacity={0.8}
            style={tw`flex-row items-center gap-1.5 bg-white/20 px-3.5 py-1.8 rounded-full border border-white/30`}
          >
            <Ionicons name={isFormOpen ? 'close' : 'add'} size={16} color="#FFFFFF" />
            <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
              {isFormOpen ? 'Cancel' : 'Add New'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── 2. Full Page Scrollable Content ── */}
        <View style={tw`flex-1 bg-slate-50`}>

        {/* ── 2. Full Page Scrollable View ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[tw`p-4`, { paddingBottom: 110 }]}
        >
          {/* Active Delivery Destination Highlight */}
          {selectedAddress && (
            <View style={tw`p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex-row items-center gap-3 mb-4`}>
              <View style={tw`w-8 h-8 rounded-xl bg-emerald-600 items-center justify-center`}>
                <Ionicons name="location-sharp" size={16} color="#FFFFFF" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-[10px] font-black text-emerald-800 uppercase tracking-wider`}>
                  Active Delivery Destination
                </Text>
                <Text style={tw`text-xs font-black text-slate-800 mt-0.5`} numberOfLines={1}>
                  {selectedAddress}
                </Text>
              </View>
            </View>
          )}

          {/* GPS Auto-Detect Quick Action Button */}
          {!isFormOpen && (
            <TouchableOpacity
              onPress={handleDetectCurrentLocation}
              disabled={isDetectingLocation}
              activeOpacity={0.85}
              style={tw`p-4 rounded-2xl bg-white border border-emerald-200/90 mb-3.5 flex-row items-center justify-between`}
            >
              <View style={tw`flex-row items-center gap-3 flex-1 mr-2`}>
                <View style={tw`w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center border border-emerald-100`}>
                  {isDetectingLocation ? (
                    <ActivityIndicator size="small" color="#059669" />
                  ) : (
                    <Ionicons name="navigate" size={19} color="#059669" />
                  )}
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-xs font-black text-slate-900`}>
                    {isDetectingLocation ? 'Detecting Location via GPS...' : 'Use Current Location'}
                  </Text>
                  <Text style={tw`text-[10px] font-medium text-slate-400 mt-0.5`}>
                    Auto-detect GPS address for 15-min delivery
                  </Text>
                </View>
              </View>
              <View style={tw`px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200`}>
                <Text style={tw`text-[10px] font-black text-emerald-700 uppercase tracking-wider`}>Detect</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* ── 3. Add / Edit Address Form Section ── */}
          {isFormOpen && (
            <View style={tw`p-4.5 rounded-2xl bg-white border border-emerald-300 mb-4`}>
              <View style={tw`flex-row items-center justify-between pb-3 mb-3 border-b border-slate-100`}>
                <View style={tw`flex-row items-center gap-2`}>
                  <View style={tw`w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center`}>
                    <Ionicons name={editingId ? 'pencil' : 'add'} size={16} color="#047857" />
                  </View>
                  <Text style={tw`text-sm font-black text-slate-800`}>
                    {editingId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                  </Text>
                </View>
                <TouchableOpacity onPress={resetForm}>
                  <Ionicons name="close" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Tag Selection Chips */}
              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2`}>
                Save address as
              </Text>
              <View style={tw`flex-row gap-2 mb-4`}>
                {(['Home', 'Work', 'Other'] as AddressTag[]).map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => setSelectedTag(tag)}
                      activeOpacity={0.8}
                      style={[
                        tw`flex-1 py-2 rounded-xl border flex-row items-center justify-center gap-1.5`,
                        isSelected
                          ? tw`bg-emerald-50 border-emerald-500`
                          : tw`bg-slate-50 border-slate-200`,
                      ]}
                    >
                      <Ionicons
                        name={tag === 'Home' ? 'home' : tag === 'Work' ? 'business' : 'location'}
                        size={13}
                        color={isSelected ? '#047857' : '#64748B'}
                      />
                      <Text
                        style={[
                          tw`text-xs font-black`,
                          isSelected ? tw`text-emerald-950` : tw`text-slate-600`,
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* House / Flat No. */}
              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
                House / Flat / Floor No. (Optional)
              </Text>
              <TextInput
                style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 mb-3 font-semibold`}
                placeholder="e.g. Flat 402, 4th Floor"
                placeholderTextColor="#94A3B8"
                value={houseNo}
                onChangeText={setHouseNo}
              />

              {/* Street / Building / Area */}
              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
                Street / Society / Area Landmark *
              </Text>
              <TextInput
                style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 mb-3 font-semibold`}
                placeholder="e.g. Green Park Tower, Sector 62"
                placeholderTextColor="#94A3B8"
                value={street}
                onChangeText={setStreet}
              />

              {/* City & Pincode Grid */}
              <View style={tw`flex-row gap-3 mb-3`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
                    City
                  </Text>
                  <TextInput
                    style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-semibold`}
                    placeholder="e.g. Noida"
                    placeholderTextColor="#94A3B8"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
                    6-Digit PIN *
                  </Text>
                  <TextInput
                    style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-semibold`}
                    placeholder="201301"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={6}
                    value={zipCode}
                    onChangeText={setZipCode}
                  />
                </View>
              </View>

              {/* State */}
              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
                State
              </Text>
              <TextInput
                style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 mb-4 font-semibold`}
                placeholder="e.g. Uttar Pradesh"
                placeholderTextColor="#94A3B8"
                value={state}
                onChangeText={setState}
              />

              {/* Action Buttons */}
              <View style={tw`flex-row gap-2.5`}>
                <TouchableOpacity
                  onPress={resetForm}
                  style={tw`flex-1 py-3 rounded-2xl bg-slate-100 items-center justify-center`}
                >
                  <Text style={tw`text-xs font-black text-slate-600`}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={addMutation.isPending || updateMutation.isPending}
                  activeOpacity={0.88}
                  style={[
                    tw`flex-2 py-3 rounded-2xl flex-row items-center justify-center gap-2`,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  {addMutation.isPending || updateMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                      <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
                        {editingId ? 'Update Address' : 'Save Address'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── 4. Saved Addresses List ── */}
          <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-3 px-1`}>
            Saved Delivery Addresses ({addresses.length})
          </Text>

          {isLoading ? (
            <View style={tw`py-20 items-center justify-center`}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={tw`text-xs font-bold text-slate-400 mt-3`}>Fetching saved addresses...</Text>
            </View>
          ) : addresses.length === 0 ? (
            /* Empty State */
            <View style={tw`py-16 items-center justify-center bg-white rounded-3xl border border-slate-200/80 p-6`}>
              <View style={tw`w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-3 border border-emerald-100`}>
                <Ionicons name="location-outline" size={32} color="#059669" />
              </View>
              <Text style={tw`text-base font-black text-slate-800 mb-1`}>No Saved Addresses</Text>
              <Text style={tw`text-xs text-slate-400 text-center mb-5 px-4 font-medium`}>
                Add your home or office address to enable instant 15-min delivery!
              </Text>
              <TouchableOpacity
                onPress={handleStartAdd}
                activeOpacity={0.88}
                style={[tw`px-6 py-2.8 rounded-2xl flex-row items-center gap-2`, { backgroundColor: theme.colors.primary }]}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>Add Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.map((addr, index) => {
              const isSelected = selectedAddress && (selectedAddress.includes(addr.street) || addr.street.includes(selectedAddress));
              const iconName = getTagIcon(addr.street);

              return (
                <View
                  key={addr.id || index}
                  style={[
                    tw`p-4 rounded-2xl bg-white mb-3 border`,
                    isSelected
                      ? tw`border-2 border-emerald-500 bg-emerald-50/30`
                      : tw`border border-slate-200/90`,
                  ]}
                >
                  {/* Address Top Row: Icon + Title + Selected Badge */}
                  <View style={tw`flex-row items-start justify-between mb-2.5`}>
                    <View style={tw`flex-row items-center gap-2.5 flex-1 mr-2`}>
                      <View style={tw`w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center border border-emerald-100`}>
                        <Ionicons name={iconName} size={18} color="#047857" />
                      </View>
                      <View style={tw`flex-1`}>
                        <View style={tw`flex-row items-center gap-2`}>
                          <Text style={tw`text-sm font-black text-slate-900`}>
                            Address #{index + 1}
                          </Text>
                          {isSelected && (
                            <View style={tw`px-2 py-0.3 rounded-full bg-emerald-100 border border-emerald-200`}>
                              <Text style={tw`text-[8px] font-black text-emerald-800 uppercase`}>Selected</Text>
                            </View>
                          )}
                        </View>
                        <Text style={tw`text-[10px] font-bold text-slate-400 mt-0.5`}>
                          PIN: {addr.zipCode}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Street & Area Details */}
                  <View style={tw`bg-slate-50 p-3 rounded-2xl mb-3 border border-slate-100`}>
                    <Text style={tw`text-xs font-black text-slate-800 mb-1 leading-4`}>
                      {addr.street}
                    </Text>
                    <Text style={tw`text-[11px] font-medium text-slate-500`}>
                      {addr.city}, {addr.state} - {addr.zipCode}
                    </Text>
                  </View>

                  {/* Bottom Actions Row */}
                  <View style={tw`flex-row items-center justify-between pt-2 border-t border-slate-100`}>
                    <TouchableOpacity
                      onPress={() => handleSelectAddress(addr)}
                      activeOpacity={0.8}
                      style={[
                        tw`flex-row items-center gap-1.5 px-3.5 py-1.6 rounded-xl`,
                        isSelected
                          ? tw`bg-emerald-100 border border-emerald-300`
                          : { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'navigate-circle'}
                        size={14}
                        color={isSelected ? '#065F46' : '#FFFFFF'}
                      />
                      <Text
                        style={[
                          tw`text-[10px] font-black uppercase tracking-wider`,
                          isSelected ? tw`text-emerald-900` : tw`text-white`,
                        ]}
                      >
                        {isSelected ? 'Delivering Here' : 'Deliver Here'}
                      </Text>
                    </TouchableOpacity>

                    <View style={tw`flex-row items-center gap-2`}>
                      <TouchableOpacity
                        onPress={() => handleStartEdit(addr)}
                        activeOpacity={0.8}
                        style={tw`flex-row items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200`}
                      >
                        <Ionicons name="pencil" size={12} color="#475569" />
                        <Text style={tw`text-[10px] font-black text-slate-700 uppercase tracking-wider`}>
                          Edit
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteConfirm(addr.id, addr.street)}
                        activeOpacity={0.8}
                        style={tw`flex-row items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200`}
                      >
                        <Ionicons name="trash" size={12} color="#E11D48" />
                        <Text style={tw`text-[10px] font-black text-rose-700 uppercase tracking-wider`}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
