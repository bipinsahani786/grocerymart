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
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, width, isMini = false }) => {
  const { cart, addToCart, removeFromCart } = useCart();

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const shadowStyle = Platform.OS === 'android' ? { elevation: 3 } : {
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  };

  // Determine badge type based on rating/price
  const showBadge = product.rating >= 4.8;

  return (
    <View style={[
      tw`rounded-2xl border`,
      isMini ? tw`p-1.5 m-0.5` : tw`p-3.5 m-1.5`,
      { 
        backgroundColor: theme.colors.cardBackground, 
        borderColor: '#F1F5F9', // light slate-100 border
      },
      width ? { width } : tw`flex-1`,
      shadowStyle
    ]}>
      {/* Top Tag & Like/Heart */}
      {!isMini && (
        <View style={tw`flex-row justify-between items-center mb-2.5`}>
          {showBadge ? (
            <View style={[tw`flex-row items-center px-2 py-0.5 rounded-full bg-amber-50`]}>
              <Ionicons name="star" size={10} color="#D97706" />
              <Text style={tw`text-[9px] font-black text-amber-700 ml-0.5`}>POPULAR</Text>
            </View>
          ) : (
            <View style={[tw`flex-row items-center px-2 py-0.5 rounded-full bg-emerald-50`]}>
              <Text style={tw`text-[9px] font-black text-emerald-700`}>ORGANIC</Text>
            </View>
          )}
          <TouchableOpacity style={[tw`w-7 h-7 rounded-full items-center justify-center bg-gray-50`]}>
            <Ionicons name="heart-outline" size={15} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Main product representation inside a graphic backdrop */}
      <View style={[
        isMini ? tw`h-15 rounded-xl mb-1.5` : tw`h-26 rounded-2xl mb-3`,
        tw`items-center justify-center bg-slate-50 border border-slate-100/50`
      ]}>
        <Text style={{ fontSize: isMini ? 32 : 64 }}>{product.emoji}</Text>
      </View>

      {/* Product Details */}
      <View style={tw`mt-auto`}>
        {isMini ? (
          <Text style={[tw`text-[8px] font-bold mb-0.5`, { color: theme.colors.textMuted }]}>{product.weight}</Text>
        ) : (
          <View style={tw`flex-row items-center justify-between mb-0.5`}>
            <Text style={[tw`text-[10px] font-bold`, { color: theme.colors.textMuted }]}>{product.weight}</Text>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text style={tw`text-[10px] font-bold text-gray-500 ml-0.5`}>{product.rating}</Text>
            </View>
          </View>
        )}

        <Text 
          style={[
            isMini ? tw`text-[10px] font-black mb-1.5` : tw`text-[14px] font-black mb-2.5`, 
            { color: theme.colors.text }
          ]} 
          numberOfLines={1}
        >
          {product.name}
        </Text>

        <View style={tw`flex-row justify-between items-center`}>
          <Text style={[isMini ? tw`text-[11px] font-black` : tw`text-[16px] font-black`, { color: theme.colors.text }]}>
            ${product.price.toFixed(1)}
          </Text>

          {quantity > 0 ? (
            <View style={[tw`flex-row items-center rounded-full border border-emerald-200 bg-emerald-50`]}>
              <TouchableOpacity
                onPress={() => removeFromCart(product.id)}
                style={isMini ? tw`p-1` : tw`px-2.5 py-1.5`}
              >
                <Ionicons name="remove" size={isMini ? 9 : 13} color="#047857" />
              </TouchableOpacity>
              <Text style={[isMini ? tw`text-[9px] px-0.5` : tw`text-[12px] px-0.5`, tw`font-black text-emerald-800`]}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => addToCart(product)}
                style={isMini ? tw`p-1` : tw`px-2.5 py-1.5`}
              >
                <Ionicons name="add" size={isMini ? 9 : 13} color="#047857" />
              </TouchableOpacity>
            </View>
          ) : (
            isMini ? (
              <TouchableOpacity
                onPress={() => addToCart(product)}
                style={[tw`w-6 h-6 rounded-full items-center justify-center bg-emerald-600 shadow-sm`]}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={11} color={theme.colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => addToCart(product)}
                style={[tw`flex-row items-center px-3.5 py-1.5 rounded-full bg-emerald-600 shadow-sm`]}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={14} color={theme.colors.white} />
                <Text style={[tw`font-extrabold text-[11px] ml-0.5`, { color: theme.colors.white }]}>ADD</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    </View>
  );
};

