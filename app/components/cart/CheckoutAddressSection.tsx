import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { StoreLocation, useCart } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CheckoutAddressSectionProps {
  fulfillmentMode: 'delivery' | 'pickup';
  selectedAddress: string;
  setSelectedAddress: (addr: string) => void;
  pincode: string;
  setPincode: (pin: string) => void;
  selectedStore: StoreLocation | null;
  setSelectedStore: (store: StoreLocation | null) => void;
  activeStores: StoreLocation[];
  onContinue: () => void;
  totalAmount: number;
}

interface AddressItem {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export const CheckoutAddressSection: React.FC<CheckoutAddressSectionProps> = ({
  fulfillmentMode,
  selectedAddress,
  setSelectedAddress,
  pincode,
  setPincode,
  selectedStore,
  setSelectedStore,
  activeStores,
  onContinue,
  totalAmount,
}) => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { setFulfillmentMode, pricing } = useCart();
  const bottomOffset = Math.max(insets.bottom, 10) + 88;

  // Query real saved addresses from database
  const { data: addresses = [], isLoading } = useQuery<AddressItem[]>({
    queryKey: ['customer-addresses'],
    queryFn: () => productService.fetchCustomerAddresses(),
  });

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPincode, setFormPincode] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(pincode || '');

  const addMutation = useMutation({
    mutationFn: (data: { street: string; city: string; state: string; zipCode: string }) =>
      productService.addCustomerAddress(data),
    onSuccess: (newAddr) => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      if (newAddr?.id) {
        setSelectedAddress(newAddr.street || newAddr.id);
        if (newAddr.zipCode) setPincode(newAddr.zipCode);
      }
      setIsEditing(false);
      resetForm();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save address.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { street: string; city: string; state: string; zipCode: string } }) =>
      productService.updateCustomerAddress(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      if (updated?.street) {
        setSelectedAddress(updated.street);
      }
      setIsEditing(false);
      resetForm();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update address.');
    },
  });

  const resetForm = () => {
    setEditId(null);
    setFormStreet('');
    setFormCity('');
    setFormState('');
    setFormPincode('');
  };

  const handleDetectLocation = async () => {
    try {
      setIsDetectingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant location permission to detect your address.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const addr = geocode[0];
        const sanitizeLocationText = (text: string) => {
          if (!text) return '';
          return text
            .replace(/[A-Z0-9]{2,8}\+[A-Z0-9]{0,6}(\s*,\s*|\s*)/gi, '')
            .replace(/\b(India|Bharat)\b/gi, '')
            .replace(/\b\d{6}\b/g, '')
            .replace(/^[\s,]+|[\s,]+$/g, '')
            .replace(/\s*,\s*,+/g, ', ')
            .replace(/\s{2,}/g, ' ')
            .trim();
        };

        let streetLine = '';

        // 1. If formattedAddress is available, use the sanitized complete location description
        if (addr.formattedAddress) {
          const cleaned = sanitizeLocationText(addr.formattedAddress);
          const parts = cleaned
            .split(',')
            .map((p) => p.trim())
            .filter((p) => p && !p.includes('+') && !p.match(/^(India|Bharat)$/i) && !p.match(/^\d{6}$/));

          if (parts.length > 0) {
            streetLine = parts.slice(0, Math.min(parts.length, 3)).join(', ');
          }
        }

        // 2. Fallback to combining detailed sub-fields if formattedAddress is unavailable or generic
        const isGeneric = (s?: string | null) =>
          !s || s.includes('+') || /^(road|street|gali|lane|unnamed road)$/i.test(s.trim());

        if (!streetLine || isGeneric(streetLine)) {
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
          streetLine = validParts.join(', ') || sanitizeLocationText(addr.formattedAddress || '') || '';
        }

        streetLine = sanitizeLocationText(streetLine);

        if (streetLine) setFormStreet(streetLine);
        if (addr.city) setFormCity(addr.city.replace(/\+/g, '').trim());
        if (addr.region) setFormState(addr.region.replace(/\+/g, '').trim());
        if (addr.postalCode && /^\d{6}$/.test(addr.postalCode.trim())) setFormPincode(addr.postalCode.trim());
      } else {
        Alert.alert('Notice', 'Location could not be detected. Please enter manually.');
      }
    } catch (err) {
      console.error('Checkout location detection error:', err);
      Alert.alert('Notice', 'Location could not be detected. Please ensure GPS is enabled.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleStartAdd = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleStartEdit = (addr: AddressItem) => {
    setEditId(addr.id);
    setFormStreet(addr.street);
    setFormCity(addr.city || '');
    setFormState(addr.state || '');
    setFormPincode(addr.zipCode || '');
    setIsEditing(true);
  };

  const handleSaveAddress = () => {
    if (!formStreet.trim() || !formPincode.trim()) {
      Alert.alert('Missing Field', 'Please enter street address and pincode.');
      return;
    }

    const payload = {
      street: formStreet.trim(),
      city: formCity.trim() || 'Central',
      state: formState.trim() || 'State',
      zipCode: formPincode.trim(),
    };

    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  return (
    <View style={tw`flex-1 bg-slate-50`}>
      {/* ── Segmented Mode Switcher (Delivery vs Store Pickup) ── */}
      <View style={tw`px-5 pt-3 pb-1`}>
        <View style={tw`flex-row bg-slate-200/80 p-1 rounded-2xl border border-slate-200`}>
          <TouchableOpacity
            onPress={() => setFulfillmentMode('delivery')}
            activeOpacity={0.85}
            style={[
              tw`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5`,
              fulfillmentMode === 'delivery'
                ? tw`bg-white border border-slate-200/40`
                : tw`bg-transparent`,
            ]}
          >
            <Ionicons
              name="bicycle"
              size={16}
              color={fulfillmentMode === 'delivery' ? '#047857' : '#64748B'}
            />
            <Text
              style={[
                tw`text-xs font-black uppercase tracking-wider`,
                fulfillmentMode === 'delivery' ? tw`text-emerald-800` : tw`text-slate-500`,
              ]}
            >
              Home Delivery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFulfillmentMode('pickup')}
            activeOpacity={0.85}
            style={[
              tw`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5`,
              fulfillmentMode === 'pickup'
                ? tw`bg-white border border-slate-200/40`
                : tw`bg-transparent`,
            ]}
          >
            <Ionicons
              name="storefront"
              size={16}
              color={fulfillmentMode === 'pickup' ? '#047857' : '#64748B'}
            />
            <Text
              style={[
                tw`text-xs font-black uppercase tracking-wider`,
                fulfillmentMode === 'pickup' ? tw`text-emerald-800` : tw`text-slate-500`,
              ]}
            >
              Store Pickup
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[tw`p-5`, { paddingBottom: 190 }]}>
        {fulfillmentMode === 'delivery' ? (
          /* ── Delivery Address Section ── */
          <View>
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider`}>
                Saved Delivery Addresses
              </Text>
              {!isEditing && (
                <TouchableOpacity onPress={handleStartAdd} style={tw`flex-row items-center gap-1`}>
                  <Ionicons name="add-circle" size={16} color="#059669" />
                  <Text style={tw`text-xs font-black text-emerald-700`}>Add New</Text>
                </TouchableOpacity>
              )}
            </View>

            {isLoading ? (
              <View style={tw`p-6 bg-white rounded-3xl border border-slate-200/70 items-center justify-center mb-3`}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={tw`text-xs font-bold text-slate-400 mt-2`}>Loading saved addresses...</Text>
              </View>
            ) : addresses.length === 0 ? (
              <View style={tw`bg-white p-6 rounded-3xl border border-slate-200/70 items-center justify-center mb-4`}>
                <View style={tw`w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center mb-2`}>
                  <Ionicons name="location-outline" size={24} color="#94A3B8" />
                </View>
                <Text style={tw`text-sm font-black text-slate-800`}>No Saved Address</Text>
                <Text style={tw`text-xs text-slate-400 text-center mt-1 mb-3`}>
                  Add your delivery address or auto-detect using GPS below.
                </Text>
              </View>
            ) : (
              addresses.map((addr) => {
                const isSelected = selectedAddress === addr.street || selectedAddress === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    onPress={() => {
                      setSelectedAddress(addr.street);
                      if (addr.zipCode) setPincode(addr.zipCode);
                    }}
                    activeOpacity={0.85}
                    style={[
                      tw`bg-white p-4 rounded-2xl border mb-3 flex-row items-center justify-between`,
                      isSelected
                        ? tw`border-emerald-600 bg-emerald-50/20`
                        : tw`border-slate-200/80`,
                    ]}
                  >
                    <View style={tw`flex-row items-center gap-3.5 flex-1 pr-3`}>
                      <View
                        style={[
                          tw`w-10 h-10 rounded-xl items-center justify-center`,
                          isSelected ? tw`bg-emerald-100` : tw`bg-slate-100`,
                        ]}
                      >
                        <Ionicons
                          name="location"
                          size={18}
                          color={isSelected ? '#059669' : '#64748B'}
                        />
                      </View>
                      <View style={tw`flex-1`}>
                        <View style={tw`flex-row items-center gap-2 mb-0.5`}>
                          <Text style={tw`text-xs font-black text-slate-900`} numberOfLines={1}>
                            {addr.street}
                          </Text>
                          {addr.zipCode ? (
                            <View style={tw`bg-slate-100 px-1.5 py-0.5 rounded-md`}>
                              <Text style={tw`text-[9px] font-black text-slate-600`}>PIN: {addr.zipCode}</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={tw`text-[11px] text-slate-500 font-medium`} numberOfLines={1}>
                          {addr.city}, {addr.state}
                        </Text>
                      </View>
                    </View>

                    <View style={tw`flex-row items-center gap-2`}>
                      <TouchableOpacity
                        onPress={() => handleStartEdit(addr)}
                        style={tw`w-7 h-7 rounded-lg bg-slate-100 items-center justify-center border border-slate-200/60`}
                      >
                        <Ionicons name="pencil" size={13} color="#64748B" />
                      </TouchableOpacity>

                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={isSelected ? '#059669' : '#CBD5E1'}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            {/* Inline Add / Edit Address Form */}
            {isEditing && (
              <View style={tw`bg-white p-5 rounded-2xl border border-slate-200/90 mb-5 gap-3`}>
                <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider`}>
                  {editId ? '📝 Edit Address' : '➕ Add Delivery Address'}
                </Text>

                {/* GPS Detect Button */}
                <TouchableOpacity
                  onPress={handleDetectLocation}
                  disabled={isDetectingLocation}
                  activeOpacity={0.8}
                  style={tw`py-2.5 px-4 rounded-xl flex-row items-center justify-center gap-2 bg-emerald-50 border border-emerald-200`}
                >
                  {isDetectingLocation ? (
                    <ActivityIndicator size="small" color="#059669" />
                  ) : (
                    <Ionicons name="navigate-circle" size={18} color="#059669" />
                  )}
                  <Text style={tw`text-xs font-black text-emerald-800 uppercase tracking-wider`}>
                    {isDetectingLocation ? 'Detecting Location...' : 'Auto-Detect via GPS'}
                  </Text>
                </TouchableOpacity>

                <View style={tw`gap-1`}>
                  <Text style={tw`text-[10px] font-black text-slate-400 uppercase`}>Street Address</Text>
                  <TextInput
                    style={tw`bg-slate-50 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 border border-slate-200`}
                    placeholder="House/Flat No., Street Name, Area"
                    placeholderTextColor="#94A3B8"
                    value={formStreet}
                    onChangeText={setFormStreet}
                  />
                </View>

                <View style={tw`flex-row gap-2.5`}>
                  <View style={tw`flex-1 gap-1`}>
                    <Text style={tw`text-[10px] font-black text-slate-400 uppercase`}>City</Text>
                    <TextInput
                      style={tw`bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 border border-slate-200`}
                      placeholder="City"
                      placeholderTextColor="#94A3B8"
                      value={formCity}
                      onChangeText={setFormCity}
                    />
                  </View>
                  <View style={tw`flex-1 gap-1`}>
                    <Text style={tw`text-[10px] font-black text-slate-400 uppercase`}>Pincode</Text>
                    <TextInput
                      style={tw`bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 border border-slate-200`}
                      placeholder="6-digit PIN"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={formPincode}
                      onChangeText={setFormPincode}
                    />
                  </View>
                </View>

                <View style={tw`flex-row gap-2 mt-1`}>
                  <TouchableOpacity
                    onPress={() => setIsEditing(false)}
                    style={tw`flex-1 py-2.5 rounded-xl bg-slate-100 items-center justify-center`}
                  >
                    <Text style={tw`text-[11px] font-black text-slate-600 uppercase`}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveAddress}
                    disabled={addMutation.isPending || updateMutation.isPending}
                    style={tw`flex-1 py-2.5 rounded-xl bg-emerald-600 items-center justify-center`}
                  >
                    {addMutation.isPending || updateMutation.isPending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={tw`text-[11px] font-black text-white uppercase`}>Save Address</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ) : (
          /* ── Store Pickup Outlet Section (Clean, Modern Cards without harsh shadows) ── */
          <View>
            <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-2`}>
              Available Retail Outlets
            </Text>
            <Text style={tw`text-xs text-slate-500 font-medium mb-3.5`}>
              Select a store to collect your order directly with ₹0 delivery fee.
            </Text>

            {/* Pincode Search Filter */}
            <View style={tw`flex-row items-center bg-white rounded-2xl px-3.5 py-1 mb-4 border border-slate-200/90`}>
              <Ionicons name="location-outline" size={17} color="#059669" style={tw`mr-2`} />
              <TextInput
                style={tw`flex-1 py-2 text-xs font-bold text-slate-800`}
                placeholder="Enter Pincode or Locality (e.g. 10001)"
                placeholderTextColor="#94A3B8"
                keyboardType="default"
                value={pincodeInput}
                onChangeText={(val) => {
                  setPincodeInput(val);
                  setPincode(val);
                }}
              />
              {pincodeInput ? (
                <TouchableOpacity
                  onPress={() => {
                    setPincodeInput('');
                    setPincode('');
                  }}
                >
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Store Selection Cards */}
            {activeStores.map((store) => {
              const isSelected = selectedStore?.id === store.id;
              return (
                <TouchableOpacity
                  key={store.id}
                  onPress={() => setSelectedStore(store)}
                  activeOpacity={0.88}
                  style={[
                    tw`bg-white p-4 rounded-2xl border mb-3 flex-row items-center justify-between`,
                    isSelected
                      ? tw`border-emerald-600 bg-emerald-50/20`
                      : tw`border-slate-200/80`,
                  ]}
                >
                  <View style={tw`flex-row items-start gap-3.5 flex-1 pr-3`}>
                    <View
                      style={[
                        tw`w-10 h-10 rounded-xl items-center justify-center mt-0.5`,
                        isSelected ? tw`bg-emerald-100` : tw`bg-slate-100`,
                      ]}
                    >
                      <Ionicons
                        name="storefront"
                        size={18}
                        color={isSelected ? '#059669' : '#475569'}
                      />
                    </View>

                    <View style={tw`flex-1`}>
                      <View style={tw`flex-row items-center gap-2 mb-1`}>
                        <Text
                          style={[
                            tw`text-xs font-extrabold text-slate-900 flex-1`,
                            isSelected && tw`text-emerald-950`,
                          ]}
                          numberOfLines={1}
                        >
                          {store.name}
                        </Text>
                        {isSelected && (
                          <View style={tw`px-2 py-0.5 rounded-md bg-emerald-600`}>
                            <Text style={tw`text-[8px] font-black text-white uppercase`}>SELECTED</Text>
                          </View>
                        )}
                      </View>

                      <View style={tw`flex-row items-center gap-1 mb-2`}>
                        <Ionicons name="location-sharp" size={11} color="#94A3B8" />
                        <Text style={tw`text-[11px] text-slate-500 font-medium flex-1`} numberOfLines={1}>
                          {store.address}
                        </Text>
                      </View>

                      {/* Store Meta Badges */}
                      <View style={tw`flex-row items-center gap-2 flex-wrap`}>
                        <View style={tw`px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60 flex-row items-center gap-1`}>
                          <Ionicons name="flash" size={10} color="#059669" />
                          <Text style={tw`text-[9px] font-black text-emerald-800`}>
                            {store.readyTime || 'Ready in 10 mins'}
                          </Text>
                        </View>

                        <View style={tw`px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60`}>
                          <Text style={tw`text-[9px] font-bold text-slate-600`}>
                            {store.distance || '0.8 km away'}
                          </Text>
                        </View>

                        <View style={tw`px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/60`}>
                          <Text style={tw`text-[9px] font-black text-blue-700`}>FREE PICKUP</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={isSelected ? '#059669' : '#CBD5E1'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Floating Clean Bottom Action Bar (Positioned above bottom navbar) ── */}
      <View
        style={[
          tw`absolute left-3 right-3 bg-white rounded-3xl border border-slate-200/90 p-3.5 px-4.5 flex-row justify-between items-center z-40`,
          Platform.OS === 'ios'
            ? {
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
              }
            : { elevation: 4 },
          { bottom: bottomOffset },
        ]}
      >
        <View style={tw`flex-1 mr-3`}>
          <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-wider`} numberOfLines={1}>
            Total Payable • {fulfillmentMode === 'pickup' ? 'FREE Pickup' : (pricing.deliveryFee === 0 ? 'FREE Delivery' : `+₹${pricing.deliveryFee.toFixed(0)} Delivery`)}
          </Text>
          <Text style={tw`text-lg font-black text-slate-900`}>₹{totalAmount.toFixed(0)}</Text>
        </View>

        <TouchableOpacity
          onPress={onContinue}
          activeOpacity={0.88}
          style={[
            tw`px-5 py-3.5 rounded-2xl flex-row items-center gap-1.5`,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
            Proceed to Payment
          </Text>
          <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
