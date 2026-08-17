import React from 'react';
import { Text, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Product } from '../data/groceryData';
import { useCart } from '../context/CartContext';
import tw from 'twrnc';

interface ProductCardProps {
  product: Product;
  width?: number;
  isMini?: boolean;
  onPress?: (product: Product) => void;
}

/**
 * Single Responsibility: Renders standard and mini product cards with fixed heights,
 * clean responsive layouts, and zero grid overflow.
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product, width, isMini = false, onPress }) => {
  const { cart, addToCart, removeFromCart } = useCart();

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const shadowStyle = Platform.OS === 'android'
    ? { elevation: 2 }
    : {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      };

  const showBadge = product.rating >= 4.8;

  // Mini 4-column Card Layout
  if (isMini) {
    return (
      <View
        style={[
          tw`w-full rounded-xl border bg-white overflow-hidden justify-between p-1.5`,
          {
            height: 154,
            borderColor: theme.colors.border || '#F1F5F9',
          },
          shadowStyle,
        ]}
      >
        <TouchableOpacity
          onPress={() => onPress && onPress(product)}
          activeOpacity={0.8}
          style={tw`w-full`}
        >
          {/* Emoji graphic representation */}
          <View style={tw`h-13 w-full rounded-lg bg-slate-50 border border-slate-100/60 items-center justify-center`}>
            <Text style={{ fontSize: 26 }}>{product.emoji}</Text>
          </View>

          {/* Product Info */}
          <View style={tw`w-full mt-1`}>
            <Text style={[tw`text-[8px] font-semibold text-slate-400`]} numberOfLines={1}>
              {product.weight}
            </Text>
            <Text style={[tw`text-[10px] font-black text-slate-800 mt-0.5`]} numberOfLines={1}>
              {product.name}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Price & Add Action Row */}
        <View style={tw`flex-row justify-between items-center w-full mt-auto pt-1`}>
          <Text style={[tw`text-[11px] font-black text-slate-900`]}>
            ₹{product.price.toFixed(0)}
          </Text>

          {quantity > 0 ? (
            <View style={tw`flex-row items-center bg-emerald-50 rounded-full border border-emerald-200 px-1 py-0.5`}>
              <TouchableOpacity onPress={() => removeFromCart(product.id)} style={tw`p-0.5`}>
                <Ionicons name="remove" size={9} color="#047857" />
              </TouchableOpacity>
              <Text style={tw`text-[9px] font-black text-emerald-800 px-0.5`}>{quantity}</Text>
              <TouchableOpacity onPress={() => addToCart(product)} style={tw`p-0.5`}>
                <Ionicons name="add" size={9} color="#047857" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => addToCart(product)}
              activeOpacity={0.8}
              style={[tw`w-5.5 h-5.5 rounded-full items-center justify-center shadow-2xs`, { backgroundColor: theme.colors.primary }]}
            >
              <Ionicons name="add" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Standard / Horizontal Carousel Card Layout
  return (
    <View
      style={[
        tw`rounded-2xl border bg-white p-3.5`,
        {
          borderColor: theme.colors.border || '#F1F5F9',
          minHeight: 220,
        },
        width ? { width } : tw`w-full`,
        shadowStyle,
      ]}
    >
      <TouchableOpacity
        onPress={() => onPress && onPress(product)}
        activeOpacity={0.8}
        style={tw`flex-1`}
      >
        {/* Top Tag & Like/Heart */}
        <View style={tw`flex-row justify-between items-center mb-2.5`}>
          {showBadge ? (
            <View style={tw`flex-row items-center px-2 py-0.5 rounded-full bg-amber-50`}>
              <Ionicons name="star" size={10} color="#D97706" />
              <Text style={tw`text-[9px] font-black text-amber-700 ml-0.5`}>POPULAR</Text>
            </View>
          ) : (
            <View style={tw`flex-row items-center px-2 py-0.5 rounded-full bg-emerald-50`}>
              <Text style={tw`text-[9px] font-black text-emerald-700`}>ORGANIC</Text>
            </View>
          )}
          <TouchableOpacity style={tw`w-7 h-7 rounded-full items-center justify-center bg-gray-50`}>
            <Ionicons name="heart-outline" size={15} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Main product representation inside a graphic backdrop */}
        <View style={tw`h-24 rounded-2xl mb-3 items-center justify-center bg-slate-50 border border-slate-100/50`}>
          <Text style={{ fontSize: 52 }}>{product.emoji}</Text>
        </View>

        {/* Product Details */}
        <View style={tw`mt-auto`}>
          <View style={tw`flex-row items-center justify-between mb-0.5`}>
            <Text style={[tw`text-[10px] font-bold text-slate-400`]}>{product.weight}</Text>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text style={tw`text-[10px] font-bold text-gray-500 ml-0.5`}>{product.rating}</Text>
            </View>
          </View>

          <Text style={[tw`text-[13px] font-black mb-2`, { color: theme.colors.text }]} numberOfLines={1}>
            {product.name}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={tw`flex-row justify-between items-center`}>
        <Text style={[tw`text-[15px] font-black`, { color: theme.colors.text }]}>
          ₹{product.price.toFixed(0)}
        </Text>

        {quantity > 0 ? (
          <View style={tw`flex-row items-center rounded-full border border-emerald-200 bg-emerald-50 px-1 py-1`}>
            <TouchableOpacity onPress={() => removeFromCart(product.id)} style={tw`px-2 py-1`}>
              <Ionicons name="remove" size={12} color="#047857" />
            </TouchableOpacity>
            <Text style={tw`text-[11px] px-1 font-black text-emerald-800`}>{quantity}</Text>
            <TouchableOpacity onPress={() => addToCart(product)} style={tw`px-2 py-1`}>
              <Ionicons name="add" size={12} color="#047857" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => addToCart(product)}
            style={[tw`flex-row items-center px-3 py-1.5 rounded-full shadow-2xs`, { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={13} color="#FFFFFF" />
            <Text style={[tw`font-extrabold text-[10px] ml-0.5 text-white`]}>ADD</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
