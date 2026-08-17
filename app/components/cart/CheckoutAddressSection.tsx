import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { StoreLocation } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CheckoutAddressSectionProps {
  fulfillmentMode: 'delivery' | 'pickup';
  selectedAddress: string;
  setSelectedAddress: (addr: string) => void;
  pincode: string;
  setPincode: (pin: string) => void;
  selectedStore: StoreLocation;
  setSelectedStore: (store: StoreLocation) => void;
  activeStores: StoreLocation[];
  onContinue: () => void;
  totalAmount: number;
}

interface AddressItem {
  id: string;
  label: string;
  street: string;
  pincode: string;
  icon: string;
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
  // Address registry state
  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: 'home',
      label: 'Home Address',
      street: 'Flat 402, Stellar Park, Sector 62, Noida, UP',
      pincode: '201301',
      icon: 'home',
    },
    {
      id: 'office',
      label: 'Office Headquarters',
      street: 'Stellar IT Park, Tower A, Sector 62, Noida, UP',
      pincode: '201301',
      icon: 'briefcase',
    },
  ]);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formLabel, setFormLabel] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formPincode, setFormPincode] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

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
        const cityLine = addr.city || '';
        const stateLine = addr.region || '';

        const fullStreet = [streetLine, cityLine, stateLine].filter(Boolean).join(', ');
        if (fullStreet) setFormStreet(fullStreet);
        if (addr.postalCode) setFormPincode(addr.postalCode);
        if (!formLabel) setFormLabel('Current Location');
      }
    } catch (err) {
      console.error('Checkout location detection error:', err);
      Alert.alert('Error', 'Failed to detect current location.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleStartAdd = () => {
    setEditId(null);
    setFormLabel('');
    setFormStreet('');
    setFormPincode('');
    setIsEditing(true);
  };

  const handleStartEdit = (addr: AddressItem) => {
    setEditId(addr.id);
    setFormLabel(addr.label);
    setFormStreet(addr.street);
    setFormPincode(addr.pincode);
    setIsEditing(true);
  };

  const handleSaveAddress = () => {
    if (!formLabel.trim() || !formStreet.trim() || !formPincode.trim()) return;

    if (editId) {
      // Edit mode
      setAddresses(
        addresses.map((addr) =>
          addr.id === editId
            ? { ...addr, label: formLabel, street: formStreet, pincode: formPincode }
            : addr
        )
      );
    } else {
      // Add mode
      const newId = 'addr_' + Date.now();
      const newAddress: AddressItem = {
        id: newId,
        label: formLabel,
        street: formStreet,
        pincode: formPincode,
        icon: 'location',
      };
      setAddresses([...addresses, newAddress]);
      setSelectedAddress(newId); // select the newly created address
    }

    setIsEditing(false);
  };

  return (
    <View style={tw`flex-1`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`p-5 pb-28`}>
        {fulfillmentMode === 'delivery' ? (
          /* Delivery Address Choice */
          <View>
            <Text style={tw`text-sm font-black text-slate-800 mb-4`}>🏡 Choose Delivery Address</Text>

            {addresses.map((addr) => (
              <View key={addr.id} style={tw`relative mb-3`}>
                <TouchableOpacity
                  onPress={() => setSelectedAddress(addr.id)}
                  activeOpacity={0.9}
                  style={[
                    tw`bg-white p-4.5 rounded-3xl border flex-row items-center justify-between shadow-sm`,
                    selectedAddress === addr.id ? tw`border-emerald-600 bg-emerald-50/10` : tw`border-slate-100`,
                  ]}
                >
                  <View style={tw`flex-row items-center gap-3.5 flex-1 pr-12`}>
                    <View style={tw`w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center`}>
                      <Ionicons name={addr.icon as any} size={20} color="#059669" />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-sm font-black text-slate-800`}>{addr.label}</Text>
                      <Text style={tw`text-xs text-slate-400 font-bold mt-1`} numberOfLines={2}>
                        {addr.street} (Pincode: {addr.pincode})
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
                      name={selectedAddress === addr.id ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={selectedAddress === addr.id ? '#059669' : '#CBD5E1'}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ))}

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
                  <Text style={tw`text-[10px] font-black text-slate-400 uppercase`}>Address Label</Text>
                  <TextInput
                    style={tw`bg-slate-50 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100`}
                    placeholder="e.g. Home, Office, Mom's Place"
                    value={formLabel}
                    onChangeText={setFormLabel}
                  />
                </View>

                <View style={tw`gap-1`}>
                  <Text style={tw`text-[10px] font-black text-slate-400 uppercase`}>Street Address</Text>
                  <TextInput
                    style={tw`bg-slate-50 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100`}
                    placeholder="Street name, apartment, block"
                    value={formStreet}
                    onChangeText={setFormStreet}
                    multiline
                  />
                </View>

                <View style={tw`gap-1`}>
                  <Text style={tw`text-[10px] font-black text-slate-400 uppercase`}>Pincode / ZIP Code</Text>
                  <TextInput
                    style={tw`bg-slate-50 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100`}
                    placeholder="6-digit Pincode"
                    keyboardType="number-pad"
                    value={formPincode}
                    onChangeText={setFormPincode}
                  />
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
                    style={tw`flex-1 py-3 rounded-2xl bg-emerald-600 items-center justify-center`}
                  >
                    <Text style={tw`text-[10px] font-black text-white uppercase`}>Save Address</Text>
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
                  style={tw`flex-1 h-12 text-sm font-black text-slate-700`}
                  placeholder="Enter pincode (e.g. 10001, 10011)"
                  keyboardType="number-pad"
                  value={pincode}
                  onChangeText={setPincode}
                />
              </View>
            </View>

            {/* Stores List matching Pincode */}
            <Text style={tw`text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3`}>
              📍 Available Stores ({activeStores.length})
            </Text>

            {activeStores.map((store) => {
              const isSelected = selectedStore.id === store.id;
              return (
                <TouchableOpacity
                  key={store.id}
                  onPress={() => setSelectedStore(store)}
                  activeOpacity={0.9}
                  style={[
                    tw`bg-white p-4.5 rounded-3xl border mb-3 flex-row items-center justify-between shadow-sm`,
                    isSelected ? tw`border-emerald-600 bg-emerald-50/10` : tw`border-slate-100`,
                  ]}
                >
                  <View style={tw`flex-row items-center gap-3.5 flex-1 pr-4`}>
                    <View style={tw`w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center`}>
                      <Ionicons name="storefront" size={19} color="#059669" />
                    </View>
                    <View style={tw`flex-1`}>
                      <View style={tw`flex-row items-center gap-2`}>
                        <Text style={tw`text-sm font-black text-slate-800`}>{store.name}</Text>
                        <Text style={tw`text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded`}>
                          {store.distance}
                        </Text>
                      </View>
                      <Text style={tw`text-xs text-slate-400 font-bold mt-1`} numberOfLines={1}>
                        {store.address}
                      </Text>
                      <Text style={tw`text-[10px] text-slate-500 font-semibold mt-1`}>
                        ⏱️ {store.readyTime}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? '#059669' : '#CBD5E1'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Footer Checkout action bar */}
      <View style={[tw`absolute left-0 right-0 bg-white border-t border-slate-100/80 px-6 py-4.5 flex-row justify-between items-center shadow-lg`, { bottom: 84 }]}>
        <View>
          <Text style={tw`text-xs font-bold text-slate-400`}>Total Amount</Text>
          <Text style={tw`text-xl font-black text-slate-800`}>₹{totalAmount}</Text>
        </View>
        <TouchableOpacity
          onPress={onContinue}
          activeOpacity={0.85}
          style={[tw`px-8 py-3.5 rounded-full flex-row items-center gap-1.5 shadow-md`, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>Continue to Payment</Text>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
