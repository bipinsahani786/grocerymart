import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { useAuthContext } from '../../context/AuthContext';
import { useSavedItems } from '../../context/SavedItemsContext';
import tw from 'twrnc';

interface ProfileActivityGridProps {
  onPressOrders?: () => void;
  onPressAddresses?: () => void;
  onPressSavedItems?: () => void;
}

/**
 * Single Responsibility: 4-Card quick activity matrix (My Orders, My Address, Payments, Wishlist).
 */
export const ProfileActivityGrid: React.FC<ProfileActivityGridProps> = ({
  onPressOrders,
  onPressAddresses,
  onPressSavedItems,
}) => {
  const { user } = useAuthContext();
  const { totalSavedCount } = useSavedItems();

  const { data: profile } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => productService.fetchProfile(),
  });

  const { data: addressesList = [] } = useQuery({
    queryKey: ['customer-addresses'],
    queryFn: () => productService.fetchCustomerAddresses(),
  });

  const { data: ordersList = [] } = useQuery({
    queryKey: ['customer-orders', user?.id, user?.phone],
    queryFn: () => productService.fetchMyOrders(user?.id, user?.phone),
  });

  const totalOrdersCount = ordersList.length > 0 ? ordersList.length : (profile?.ordersCount ?? user?.totalOrders ?? 0);

  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 px-1`}>
        Activity & Orders
      </Text>
      <View style={tw`flex-row flex-wrap justify-between`}>
        {/* 1. My Orders */}
        <TouchableOpacity
          onPress={onPressOrders}
          style={tw`w-[48.5%] p-3.5 rounded-2xl bg-white border border-slate-100 mb-3 shadow-sm`}
          activeOpacity={0.7}
        >
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <View style={tw`w-8 h-8 rounded-xl bg-blue-50 items-center justify-center`}>
              <Ionicons name="bag-handle-outline" size={17} color="#2563EB" />
            </View>
            <View style={tw`px-1.5 py-0.5 rounded-md bg-emerald-100`}>
              <Text style={tw`text-[9px] font-black text-emerald-800`}>
                {totalOrdersCount} Orders
              </Text>
            </View>
          </View>
          <Text style={tw`text-xs font-black text-slate-800`}>My Orders</Text>
          <Text style={tw`text-[10px] font-medium text-slate-400 mt-0.5`}>Track & reorder items</Text>
        </TouchableOpacity>

        {/* 2. My Address */}
        <TouchableOpacity
          onPress={onPressAddresses}
          style={tw`w-[48.5%] p-3.5 rounded-2xl bg-white border border-slate-100 mb-3 shadow-sm`}
          activeOpacity={0.7}
        >
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <View style={tw`w-8 h-8 rounded-xl bg-purple-50 items-center justify-center`}>
              <Ionicons name="location-outline" size={17} color="#7C3AED" />
            </View>
            <View style={tw`px-1.5 py-0.5 rounded-md bg-purple-100`}>
              <Text style={tw`text-[9px] font-black text-purple-800`}>
                {addressesList.length} Saved
              </Text>
            </View>
          </View>
          <Text style={tw`text-xs font-black text-slate-800`}>My Address</Text>
          <Text style={tw`text-[10px] font-medium text-slate-400 mt-0.5`}>Saved home & offices</Text>
        </TouchableOpacity>

        {/* 3. Payment Methods */}
        <TouchableOpacity
          style={tw`w-[48.5%] p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm`}
          activeOpacity={0.7}
        >
          <View style={tw`w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center mb-2`}>
            <Ionicons name="card-outline" size={17} color="#059669" />
          </View>
          <Text style={tw`text-xs font-black text-slate-800`}>Payments</Text>
          <Text style={tw`text-[10px] font-medium text-slate-400 mt-0.5`}>UPI, Cards & COD</Text>
        </TouchableOpacity>

        {/* 4. Saved Items */}
        <TouchableOpacity
          onPress={onPressSavedItems}
          style={tw`w-[48.5%] p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm`}
          activeOpacity={0.7}
        >
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <View style={tw`w-8 h-8 rounded-xl bg-rose-50 items-center justify-center`}>
              <Ionicons name="heart-outline" size={17} color="#E11D48" />
            </View>
            <View style={tw`px-1.5 py-0.5 rounded-md bg-rose-100`}>
              <Text style={tw`text-[9px] font-black text-rose-800`}>
                {totalSavedCount} Items
              </Text>
            </View>
          </View>
          <Text style={tw`text-xs font-black text-slate-800`}>Saved Items</Text>
          <Text style={tw`text-[10px] font-medium text-slate-400 mt-0.5`}>Favorite groceries</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
