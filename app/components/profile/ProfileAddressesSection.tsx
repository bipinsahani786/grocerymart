import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface AddressItem {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export const ProfileAddressesSection: React.FC = () => {
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Noida');
  const [state, setState] = useState('Uttar Pradesh');
  const [zipCode, setZipCode] = useState('201301');

  const { data: addresses = [], isLoading } = useQuery<AddressItem[]>({
    queryKey: ['customer-addresses'],
    queryFn: () => productService.fetchCustomerAddresses(),
  });

  const addMutation = useMutation({
    mutationFn: (newAddr: { street: string; city: string; state: string; zipCode: string }) =>
      productService.addCustomerAddress(newAddr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      setIsAdding(false);
      setStreet('');
      setZipCode('201301');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save address to backend.');
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

  const handleSave = () => {
    if (!street.trim()) {
      Alert.alert('Missing Field', 'Please enter your street address.');
      return;
    }
    if (!zipCode.trim()) {
      Alert.alert('Missing Field', 'Please enter your area pincode.');
      return;
    }
    addMutation.mutate({
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
    });
  };

  return (
    <View style={tw`mb-4`}>
      <View style={tw`flex-row justify-between items-center mb-2.5 px-1`}>
        <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider`}>
          My Addresses ({addresses.length})
        </Text>
        <TouchableOpacity
          onPress={() => setIsAdding(!isAdding)}
          style={tw`flex-row items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200`}
        >
          <Ionicons name={isAdding ? 'close' : 'add'} size={14} color="#047857" />
          <Text style={tw`text-[10px] font-black text-emerald-800 uppercase tracking-wider`}>
            {isAdding ? 'Cancel' : 'Add New'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add New Address Inline Form */}
      {isAdding && (
        <View style={tw`p-4 rounded-3xl bg-white border border-emerald-200 mb-3.5 shadow-sm`}>
          <Text style={tw`text-xs font-black text-slate-800 mb-3`}>Add Delivery Address</Text>
          
          <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
            Street / Flat / Colony
          </Text>
          <TextInput
            style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 mb-3 font-medium`}
            placeholder="e.g. Flat 301, Tower C, Stellar Park"
            placeholderTextColor="#94A3B8"
            value={street}
            onChangeText={setStreet}
          />

          <View style={tw`flex-row gap-3 mb-3`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
                City
              </Text>
              <TextInput
                style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 font-medium`}
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
                State
              </Text>
              <TextInput
                style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 font-medium`}
                value={state}
                onChangeText={setState}
              />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1`}>
                Pincode
              </Text>
              <TextInput
                style={tw`bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 font-medium`}
                keyboardType="numeric"
                maxLength={6}
                value={zipCode}
                onChangeText={setZipCode}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={addMutation.isPending}
            style={[
              tw`py-3 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm`,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            {addMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
                  Save Address to Backend
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Addresses List Container */}
      <View style={tw`rounded-3xl bg-white border border-slate-100 p-2 shadow-sm`}>
        {isLoading ? (
          <View style={tw`py-6 items-center justify-center`}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={tw`text-[10px] font-bold text-slate-400 mt-2`}>Loading addresses from database...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={tw`py-6 items-center justify-center`}>
            <Ionicons name="location-outline" size={28} color="#CBD5E1" />
            <Text style={tw`text-xs font-black text-slate-600 mt-2`}>No saved addresses found</Text>
            <Text style={tw`text-[10px] text-slate-400 mt-0.5`}>Add an address above to get started</Text>
          </View>
        ) : (
          addresses.map((addr, index) => (
            <View
              key={addr.id || index}
              style={[
                tw`p-3.5 rounded-2xl flex-row items-center justify-between`,
                index !== addresses.length - 1 ? tw`border-b border-slate-100 mb-1` : null,
              ]}
            >
              <View style={tw`flex-row items-center gap-3 flex-1 mr-2`}>
                <View style={tw`w-9 h-9 rounded-xl bg-purple-50 items-center justify-center`}>
                  <Ionicons name="location" size={18} color="#7C3AED" />
                </View>
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-center gap-2 mb-0.5`}>
                    <Text style={tw`text-xs font-black text-slate-800`} numberOfLines={1}>
                      {addr.street}
                    </Text>
                    {index === 0 && (
                      <View style={tw`px-1.5 py-0.2 rounded-md bg-emerald-100`}>
                        <Text style={tw`text-[8px] font-black text-emerald-800 uppercase`}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={tw`text-[10px] font-medium text-slate-400`} numberOfLines={1}>
                    {addr.city}, {addr.state} - {addr.zipCode}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => deleteMutation.mutate(addr.id)}
                style={tw`w-7 h-7 rounded-full bg-slate-50 border border-slate-100 items-center justify-center`}
              >
                <Ionicons name="trash-outline" size={13} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
};
