import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resolveImageUrl } from '../../utils/image';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CartItemData {
  id: string;
  name: string;
  price: number;
  weight: string;
  emoji?: string;
  image?: string | null;
  imageUrl?: string | null;
  quantity: number;
}

interface CartItemListProps {
  items: CartItemData[];
  onAdd: (item: CartItemData) => void;
  onRemove: (id: string) => void;
  onAddMore?: () => void;
}

/**
 * Single Responsibility: Renders line items in a clean, unified continuous surface
 * with crisp product details, item subtotals, and a fluid quantity stepper.
 */
export const CartItemList: React.FC<CartItemListProps> = ({ items, onAdd, onRemove, onAddMore }) => {
  return (
    <View style={tw`bg-white py-3`}>
      <View style={tw`px-4 pb-2 flex-row justify-between items-center border-b border-slate-100`}>
        <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider`}>
          Items in Cart ({items.length})
        </Text>
        {onAddMore && (
          <TouchableOpacity onPress={onAddMore} activeOpacity={0.7} style={tw`flex-row items-center gap-1`}>
            <Ionicons name="add-circle" size={15} color="#047857" />
            <Text style={tw`text-xs font-black text-emerald-800`}>Add More</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={tw`px-4`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const itemSubtotal = (item.price * item.quantity).toFixed(0);
          const itemImage = resolveImageUrl(item.image || item.imageUrl);

          return (
            <View
              key={item.id}
              style={[
                tw`flex-row items-center justify-between py-3`,
                !isLast && tw`border-b border-slate-100/80`,
              ]}
            >
              {/* Left Side: Thumbnail & Title */}
              <View style={tw`flex-row items-center gap-3 flex-1 mr-3`}>
                <View style={tw`w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 justify-center items-center overflow-hidden`}>
                  {itemImage ? (
                    <Image
                      source={{ uri: itemImage }}
                      style={tw`w-full h-full`}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={tw`w-full h-full bg-slate-50`} />
                  )}
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-xs font-black text-slate-900 leading-4`} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={tw`text-[10px] font-bold text-slate-400 mt-0.5`}>
                    {item.weight || '1 unit'} • ₹{item.price.toFixed(0)}/unit
                  </Text>
                  <Text style={tw`text-xs font-black text-slate-900 mt-1`}>
                    ₹{itemSubtotal}
                  </Text>
                </View>
              </View>

              {/* Right Side: Quantity Stepper */}
              <View style={tw`flex-row items-center bg-emerald-50 rounded-full px-1 py-0.5 border border-emerald-200/80`}>
                <TouchableOpacity
                  onPress={() => onRemove(item.id)}
                  style={tw`w-7 h-7 rounded-full justify-center items-center bg-white border border-emerald-100`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                    size={item.quantity === 1 ? 12 : 13}
                    color={item.quantity === 1 ? '#E11D48' : '#047857'}
                  />
                </TouchableOpacity>

                <Text style={tw`px-2.5 text-xs font-black text-emerald-950 min-w-5 text-center`}>
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  onPress={() => onAdd(item)}
                  style={[
                    tw`w-7 h-7 rounded-full justify-center items-center`,
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
