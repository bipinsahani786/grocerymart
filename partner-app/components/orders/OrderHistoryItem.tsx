import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { DeliveryOrder } from '../../constants/mockData';
import tw from 'twrnc';

interface OrderHistoryItemProps {
  order: DeliveryOrder;
  onPress: () => void;
}

export const OrderHistoryItem: React.FC<OrderHistoryItemProps> = ({ order, onPress }) => {
  const isDelivered = order.status === 'DELIVERED';
  const isCOD = order.paymentMode === 'CASH_ON_DELIVERY';
  const distanceText = order.customerDistanceKm ? `${order.customerDistanceKm} km` : '3.2 km';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={tw`py-3.5 border-b border-slate-100`}
    >
      {/* Top Meta Line: Time + Order ID + Status + Payout */}
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-xs font-black text-slate-900 mr-2`}>
            #{order.orderNumber}
          </Text>
          <View
            style={[
              tw`px-2 py-0.5 rounded-full flex-row items-center`,
              isDelivered
                ? tw`bg-emerald-50 border border-emerald-200`
                : tw`bg-amber-50 border border-amber-200`,
            ]}
          >
            <View
              style={[
                tw`w-1.5 h-1.5 rounded-full mr-1`,
                isDelivered ? tw`bg-emerald-600` : tw`bg-amber-500`,
              ]}
            />
            <Text
              style={[
                tw`text-[10px] font-black`,
                isDelivered ? tw`text-emerald-700` : tw`text-amber-700`,
              ]}
            >
              {isDelivered ? 'Delivered' : order.status}
            </Text>
          </View>
        </View>

        {/* Payout & Tip Badge */}
        <View style={tw`flex-row items-center`}>
          {order.tipAmount > 0 && (
            <View style={tw`mr-1.5 px-1.5 py-0.5 rounded-md bg-pink-50 border border-pink-200`}>
              <Text style={tw`text-[9px] font-black text-pink-600`}>
                +₹{order.tipAmount} Tip
              </Text>
            </View>
          )}
          <Text style={tw`text-sm font-black text-emerald-700`}>
            ₹{order.totalPayout}
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#94A3B8" style={tw`ml-1`} />
        </View>
      </View>

      {/* Clean Route Node Timeline */}
      <View style={tw`pl-1 my-1`}>
        {/* Pickup Store Node */}
        <View style={tw`flex-row items-center`}>
          <View style={tw`w-2 h-2 rounded-full bg-blue-500 mr-2.5`} />
          <Text style={tw`text-xs font-bold text-slate-800 flex-1`} numberOfLines={1}>
            {order.storeName}
          </Text>
        </View>

        {/* Connecting Hairline */}
        <View style={tw`w-[1.5px] h-3 bg-slate-200 ml-[3.5px] my-0.5`} />

        {/* Drop Customer Node */}
        <View style={tw`flex-row items-center`}>
          <View style={tw`w-2 h-2 rounded-full bg-emerald-500 mr-2.5`} />
          <Text style={tw`text-xs text-slate-600 flex-1`} numberOfLines={1}>
            {order.customerAddress}
          </Text>
        </View>
      </View>

      {/* Bottom Sub-line: Items Count • Payment Mode • Delivered Time */}
      <View style={tw`flex-row justify-between items-center mt-2 pt-1.5`}>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-[11px] text-slate-400 font-medium`}>
            {order.itemsCount} items • {distanceText}
          </Text>
          <Text style={tw`text-[11px] text-slate-300 mx-1.5`}>•</Text>
          <View
            style={[
              tw`px-1.5 py-0.2 rounded`,
              isCOD ? tw`bg-amber-100` : tw`bg-slate-100`,
            ]}
          >
            <Text
              style={[
                tw`text-[9px] font-black`,
                isCOD ? tw`text-amber-800` : tw`text-slate-600`,
              ]}
            >
              {isCOD ? 'COD Cash' : 'Prepaid'}
            </Text>
          </View>
        </View>

        <Text style={tw`text-[11px] font-bold text-slate-400`}>
          {order.deliveredAt || order.createdAt}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

