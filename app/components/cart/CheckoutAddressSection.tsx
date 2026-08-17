import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StoreLocation } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CheckoutAddressSectionProps {
  fulfillmentMode: 'delivery' | 'pickup';
  selectedAddress: 'home' | 'office';
  setSelectedAddress: (addr: 'home' | 'office') => void;
  pincode: string;
  setPincode: (pin: string) => void;
  selectedStore: StoreLocation;
  setSelectedStore: (store: StoreLocation) => void;
  activeStores: StoreLocation[];
  onContinue: () => void;
  totalAmount: number;
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
  return (
    <View style={tw`flex-1`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`p-5 pb-28`}>
        {fulfillmentMode === 'delivery' ? (
          /* Delivery Address Choice */
          <View>
            <Text style={tw`text-sm font-black text-slate-800 mb-4`}>🏡 Choose Delivery Address</Text>

            <TouchableOpacity
              onPress={() => setSelectedAddress('home')}
              activeOpacity={0.9}
              style={[
                tw`bg-white p-4.5 rounded-3xl border mb-3 flex-row items-center justify-between shadow-2xs`,
                selectedAddress === 'home' ? tw`border-emerald-600 bg-emerald-50/10` : tw`border-slate-100`,
              ]}
            >
              <View style={tw`flex-row items-center gap-3.5 flex-1 pr-4`}>
                <View style={tw`w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center`}>
                  <Ionicons name="home" size={20} color="#059669" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-black text-slate-800`}>Home Address</Text>
                  <Text style={tw`text-xs text-slate-400 font-bold mt-1`} numberOfLines={2}>
                    123 Main Street, New York, NY (Pincode: 10001)
                  </Text>
                </View>
              </View>
              <Ionicons
                name={selectedAddress === 'home' ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selectedAddress === 'home' ? '#059669' : '#CBD5E1'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedAddress('office')}
              activeOpacity={0.9}
              style={[
                tw`bg-white p-4.5 rounded-3xl border mb-3 flex-row items-center justify-between shadow-2xs`,
                selectedAddress === 'office' ? tw`border-emerald-600 bg-emerald-50/10` : tw`border-slate-100`,
              ]}
            >
              <View style={tw`flex-row items-center gap-3.5 flex-1 pr-4`}>
                <View style={tw`w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center`}>
                  <Ionicons name="briefcase" size={20} color="#059669" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-black text-slate-800`}>Office Headquarters</Text>
                  <Text style={tw`text-xs text-slate-400 font-bold mt-1`} numberOfLines={2}>
                    55 Wall Street, Financial District, New York, NY (Pincode: 10005)
                  </Text>
                </View>
              </View>
              <Ionicons
                name={selectedAddress === 'office' ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selectedAddress === 'office' ? '#059669' : '#CBD5E1'}
              />
            </TouchableOpacity>
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
              <View style={tw`flex-1 flex-row items-center bg-white rounded-2xl px-4 border border-slate-100 shadow-2xs`}>
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
                    tw`bg-white p-4.5 rounded-3xl border mb-3 flex-row items-center justify-between shadow-2xs`,
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
