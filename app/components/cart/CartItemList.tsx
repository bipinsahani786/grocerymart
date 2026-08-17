import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CartItemData {
  id: string;
  name: string;
  price: number;
  weight: string;
  emoji: string;
  quantity: number;
}

interface CartItemListProps {
  items: CartItemData[];
  onAdd: (item: CartItemData) => void;
  onRemove: (id: string) => void;
}

/**
 * Single Responsibility: Renders line items with product details, unit price, and fluid quantity stepper.
 */
export const CartItemList: React.FC<CartItemListProps> = ({ items, onAdd, onRemove }) => {
  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 px-5`}>
        Items in Basket ({items.length})
      </Text>

      <View style={tw`rounded-3xl bg-white border border-slate-100 p-2 shadow-sm`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const itemSubtotal = (item.price * item.quantity).toFixed(2);

          return (
            <View
              key={item.id}
              style={[
                tw`flex-row items-center justify-between p-2.5`,
                !isLast && tw`border-b border-slate-50`,
              ]}
            >
              {/* Product Info */}
              <View style={tw`flex-row items-center gap-3 flex-1 mr-2`}>
                <View style={tw`w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100/60 justify-center items-center`}>
                  <Text style={tw`text-2xl`}>{item.emoji}</Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-xs font-black text-slate-900`]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={tw`text-[10px] font-semibold text-slate-400 mt-0.5`}>
                    ₹{item.price.toFixed(0)} • {item.weight}
                  </Text>
                  <Text style={[tw`text-xs font-extrabold mt-0.5`, { color: theme.colors.primary }]}>
                    ₹{itemSubtotal}
                  </Text>
                </View>
              </View>

              {/* Quantity Stepper */}
              <View style={tw`flex-row items-center bg-slate-50 rounded-full p-1 border border-slate-100`}>
                <TouchableOpacity
                  onPress={() => onRemove(item.id)}
                  style={tw`w-7 h-7 rounded-full justify-center items-center bg-white shadow-sm`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                    size={item.quantity === 1 ? 12 : 14}
                    color={item.quantity === 1 ? '#E11D48' : theme.colors.text}
                  />
                </TouchableOpacity>

                <Text style={[tw`px-2.5 text-xs font-black`, { color: theme.colors.text }]}>
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  onPress={() => onAdd(item)}
                  style={[
                    tw`w-7 h-7 rounded-full justify-center items-center shadow-sm`,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
