import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { StoreLocation } from '../../context/CartContext';
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
  const queryClient = useQueryClient();

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

        const streetLine = validParts.join(', ') || addr.name || addr.street || '';
        if (streetLine) setFormStreet(streetLine);
        if (addr.city) setFormCity(addr.city);
        if (addr.region) setFormState(addr.region);
        if (addr.postalCode) setFormPincode(addr.postalCode);
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
      city: formCity.trim() || 'Noida',
      state: formState.trim() || 'Uttar Pradesh',
      zipCode: formPincode.trim(),
    };

    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  return (
    <View style={tw`flex-1`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`p-5 pb-28`}>
        {fulfillmentMode === 'delivery' ? (
          /* Delivery Address Choice */
          <View>
            <Text style={tw`text-sm font-black text-slate-800 mb-4`}>🏡 Choose Delivery Address</Text>

            {isLoading ? (
              <View style={tw`p-6 bg-white rounded-3xl border border-slate-100 items-center justify-center mb-3`}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={tw`text-xs font-bold text-slate-400 mt-2`}>Loading saved addresses...</Text>
              </View>
            ) : addresses.length === 0 ? (
              <View style={tw`bg-white p-6 rounded-3xl border border-slate-100 items-center justify-center mb-4`}>
                <Ionicons name="location-outline" size={32} color="#94A3B8" style={tw`mb-2`} />
                <Text style={tw`text-sm font-black text-slate-700`}>No Saved Address Found</Text>
                <Text style={tw`text-xs text-slate-400 text-center mt-1 mb-3`}>
                  Add your delivery address below or auto-detect via GPS.
                </Text>
              </View>
            ) : (
              addresses.map((addr) => {
                const isSelected = selectedAddress === addr.street || selectedAddress === addr.id;
                return (
                  <View key={addr.id} style={tw`relative mb-3`}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedAddress(addr.street);
                        if (addr.zipCode) setPincode(addr.zipCode);
                      }}
                      activeOpacity={0.9}
                      style={[
                        tw`bg-white p-4.5 rounded-3xl border flex-row items-center justify-between shadow-sm`,
                        isSelected ? tw`border-emerald-600 bg-emerald-50/10` : tw`border-slate-100`,
                      ]}
                    >
                      <View style={tw`flex-row items-center gap-3.5 flex-1 pr-12`}>
                        <View style={tw`w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center`}>
                          <Ionicons name="location" size={20} color="#059669" />
                        </View>
                        <View style={tw`flex-1`}>
                          <Text style={tw`text-sm font-black text-slate-800`}>{addr.street}</Text>
                          <Text style={tw`text-xs text-slate-400 font-bold mt-1`} numberOfLines={2}>
                            {addr.city}, {addr.state} (PIN: {addr.zipCode})
                          </Text>
                        </View>
                      </View>

                      <View style={tw`flex-row items-center gap-2`}>
                        <TouchableOpacity
                          onPress={() => handleStartEdit(addr)}
                          style={tw`w-8 h-8 rounded-full bg-slate-50 items-center justify-center border border-slate-100`}
                        >
                          <Ionicons name="pencil" size={14} color="#64748B" />
                        </TouchableOpacity>

                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={22}
                          color={isSelected ? '#059669' : '#CBD5E1'}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}

            {/* Add Address Dashed Trigger Button */}
            {!isEditing && (
              <TouchableOpacity
                onPress={handleStartAdd}
                activeOpacity={0.8}
                style={tw`border border-dashed border-slate-300 bg-slate-50/40 p-4 rounded-3xl items-center justify-center mb-5`}
              >
                <View style={tw`flex-row items-center gap-2`}>
                  <Ionicons name="add-circle" size={18} color="#059669" />
                  <Text style={tw`text-xs font-black text-slate-600`}>Add New Address</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Add/Edit Inline Form Card */}
            {isEditing && (
              <View style={tw`bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-5 gap-3.5`}>
                <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider`}>
                  {editId ? '📝 Edit Address' : '➕ Add Address'}
                </Text>

                {/* GPS Detect Button */}
                <TouchableOpacity
                  onPress={handleDetectLocation}
                  disabled={isDetectingLocation}
                  activeOpacity={0.8}
                  style={[
                    tw`py-2.5 px-4 rounded-2xl flex-row items-center justify-center gap-2 border shadow-2xs`,
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
                    {isDetectingLocation ? 'Detecting Location...' : 'Detect Current GPS Location'}
                  </Text>
                </TouchableOpacity>

                <View style={tw`gap-1`}>
                  <Text style={tw`text-[10px] font-black text-slate-400 uppercase`}>Street Address</Text>
                  <TextInput
                    style={tw`bg-slate-50 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100`}
                    placeholder="Enter street, flat or apartment"
                    value={formStreet}
                    onChangeText={setFormStreet}
                    multiline
                  />
                </View>

                <View style={tw`flex-row gap-3`}>
                  <View style={tw`flex-1 gap-1`}>
                    <Text style={tw`text-[10px] font-black text-slate-400 uppercase`}>City</Text>
                    <TextInput
                      style={tw`bg-slate-50 px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100`}
                      placeholder="City"
                      value={formCity}
                      onChangeText={setFormCity}
                    />
                  </View>
                  <View style={tw`flex-1 gap-1`}>
                    <Text style={tw`text-[10px] font-black text-slate-400 uppercase`}>Pincode / ZIP</Text>
                    <TextInput
                      style={tw`bg-slate-50 px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100`}
                      placeholder="6-digit PIN"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={formPincode}
                      onChangeText={setFormPincode}
                    />
                  </View>
                </View>

                <View style={tw`flex-row gap-2 mt-2`}>
                  <TouchableOpacity
                    onPress={() => setIsEditing(false)}
                    style={tw`flex-1 py-3 rounded-2xl bg-slate-100 items-center justify-center`}
                  >
                    <Text style={tw`text-[10px] font-black text-slate-500 uppercase`}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveAddress}
                    disabled={addMutation.isPending || updateMutation.isPending}
                    style={tw`flex-1 py-3 rounded-2xl bg-emerald-600 items-center justify-center`}
                  >
                    {addMutation.isPending || updateMutation.isPending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={tw`text-[10px] font-black text-white uppercase`}>Save Address</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ) : (
          /* Takeaway Nearest Store Choice by Pincode */
          <View>
            <Text style={tw`text-sm font-black text-slate-800 mb-2`}>🏬 Nearest Pickup Store</Text>
            <Text style={tw`text-xs text-slate-400 font-bold mb-4`}>
              Enter your area pincode to find nearest retail stores
            </Text>

            {/* Pincode Search Box */}
            <View style={tw`flex-row gap-3 mb-5`}>
              <View style={tw`flex-1 flex-row items-center bg-white rounded-2xl px-4 border border-slate-100 shadow-sm`}>
                <Ionicons name="location-outline" size={18} color="#64748B" style={tw`mr-2`} />
                <TextInput
                  style={tw`flex-1 py-3 text-xs font-bold text-slate-800`}
                  placeholder="Enter 6-digit Pincode"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={pincode}
                  onChangeText={(val) => setPincode(val)}
                />
              </View>
            </View>

            {/* Stores List */}
            {activeStores.map((store) => (
              <TouchableOpacity
                key={store.id}
                onPress={() => setSelectedStore(store)}
                activeOpacity={0.9}
                style={[
                  tw`bg-white p-4.5 rounded-3xl border mb-3 flex-row items-center justify-between shadow-sm`,
                  selectedStore?.id === store.id ? tw`border-emerald-600 bg-emerald-50/10` : tw`border-slate-100`,
                ]}
              >
                <View style={tw`flex-row items-center gap-3.5 flex-1 pr-4`}>
                  <View style={tw`w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center`}>
                    <Ionicons name="storefront" size={20} color="#059669" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-sm font-black text-slate-800`}>{store.name}</Text>
                    <Text style={tw`text-xs text-slate-400 font-bold mt-0.5`} numberOfLines={1}>
                      {store.address}
                    </Text>
                    <View style={tw`flex-row items-center gap-3 mt-1.5`}>
                      <Text style={tw`text-[10px] font-black text-emerald-600`}>⚡ {store.readyTime}</Text>
                      <Text style={tw`text-[10px] text-slate-400 font-bold`}>• {store.distance}</Text>
                    </View>
                  </View>
                </View>

                <Ionicons
                  name={selectedStore?.id === store.id ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selectedStore?.id === store.id ? '#059669' : '#CBD5E1'}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Persistent Bottom Proceed Banner */}
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 px-6 flex-row justify-between items-center shadow-lg`}>
        <View>
          <Text style={tw`text-[10px] font-black text-slate-400 uppercase`}>To Pay</Text>
          <Text style={tw`text-lg font-black text-slate-900`}>₹{totalAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          onPress={onContinue}
          activeOpacity={0.9}
          style={tw`bg-emerald-600 px-7 py-3.5 rounded-2xl flex-row items-center gap-2 shadow-sm`}
        >
          <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>Proceed to Payment</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
