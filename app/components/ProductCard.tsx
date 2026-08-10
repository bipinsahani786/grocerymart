import React from 'react';
import { Text, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Product } from '../data/groceryData';
import { useCart } from '../context/CartContext';
import tw from 'twrnc';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, removeFromCart } = useCart();

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const shadowStyle = Platform.OS === 'android' ? { elevation: 2 } : {
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  };

  return (
    <View style={[
      tw`rounded-xl p-3 border flex-1 m-1.5`,
      { 
        backgroundColor: theme.colors.cardBackground, 
        borderColor: theme.colors.border 
      },
      shadowStyle
    ]}>
      {/* Favorite / Rating top row */}
      <View style={tw`flex-row justify-between items-center mb-1`}>
        <View style={[tw`flex-row items-center px-1.5 py-0.5 rounded-sm`, { backgroundColor: theme.colors.accentLight }]}>
          <Ionicons name="star" size={10} color={theme.colors.accent} />
          <Text style={[tw`text-[10px] font-bold ml-0.5`, { color: theme.colors.accent }]}>{product.rating}</Text>
        </View>
        <TouchableOpacity style={[tw`w-6 h-6 rounded-full items-center justify-center`, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="heart-outline" size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Main product representation */}
      <View style={tw`h-20 items-center justify-center mb-2`}>
        <Text style={tw`text-[54px]`}>{product.emoji}</Text>
      </View>

      {/* Product Details */}
      <View style={tw`mt-auto`}>
        <Text style={[tw`text-[10px] font-semibold mb-0.5`, { color: theme.colors.textMuted }]}>{product.weight}</Text>
        <Text style={[tw`text-[14px] font-bold mb-2`, { color: theme.colors.text }]} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={tw`flex-row justify-between items-center`}>
          <Text style={[tw`text-[15px] font-extrabold`, { color: theme.colors.text }]}>${product.price.toFixed(2)}</Text>

          {quantity > 0 ? (
            <View style={[tw`flex-row items-center rounded-sm border`, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}>
              <TouchableOpacity
                onPress={() => removeFromCart(product.id)}
                style={tw`px-2 py-1.5`}
              >
                <Ionicons name="remove" size={14} color={theme.colors.primaryDark} />
              </TouchableOpacity>
              <Text style={[tw`text-[13px] font-bold px-1`, { color: theme.colors.primaryDark }]}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => addToCart(product)}
                style={tw`px-2 py-1.5`}
              >
                <Ionicons name="add" size={14} color={theme.colors.primaryDark} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => addToCart(product)}
              style={[tw`flex-row items-center px-2.5 py-1.5 rounded-sm`, { backgroundColor: theme.colors.primary }]}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color={theme.colors.white} />
              <Text style={[tw`font-bold text-[12px] ml-0.5`, { color: theme.colors.white }]}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
