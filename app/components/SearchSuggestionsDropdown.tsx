import React, { useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, ScrollView, Platform, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Product } from '../data/groceryData';
import { productService } from '../services/product.service';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../utils/image';
import { theme } from '../constants/theme';
import tw from 'twrnc';

interface SearchSuggestionsDropdownProps {
  query: string;
  onSelectSuggestion: (query: string) => void;
  onClose: () => void;
}

/**
 * Single Responsibility: Responsive autocomplete dropdown that automatically hides when empty,
 * renders a small compact pill when nothing is found, and expands with rich live matches.
 */
export const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = ({
  query,
  onSelectSuggestion,
  onClose,
}) => {
  const { cart, addToCart, pincode } = useCart();
  const trimmedQuery = query.trim().toLowerCase();

  // Animation values for smooth entrance
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-8)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, translateYAnim, scaleAnim]);

  // Fetch real matching products from database
  const { data: matchingProducts = [] } = useQuery<Product[]>({
    queryKey: ['search-suggestions', trimmedQuery, pincode],
    queryFn: () => productService.fetchProducts({ search: trimmedQuery, pincode }),
    enabled: trimmedQuery.length > 0,
  });

  // If searchbar is empty, return null immediately
  if (trimmedQuery.length === 0) {
    return null;
  }

  // ── Small / Compact Dropdown when nothing is found ──
  if (matchingProducts.length === 0) {
    return (
      <Animated.View
        style={[
          tw`absolute top-14 left-0 right-0 z-50 bg-white rounded-t-lg rounded-b-2xl border border-slate-100 px-4 py-3 shadow-xl`,
          {
            opacity: opacityAnim,
            transform: [
              { translateY: translateYAnim },
              { scale: scaleAnim },
            ],
          },
          Platform.OS === 'android'
            ? { elevation: 16 }
            : {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
              },
        ]}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center gap-2 flex-1 mr-2`}>
            <View style={tw`w-7 h-7 rounded-xl bg-slate-50 items-center justify-center`}>
              <Ionicons name="search" size={13} color="#94A3B8" />
            </View>
            <Text style={tw`text-xs font-bold text-slate-600`} numberOfLines={1}>
              {`No items matching "${query}"`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={tw`p-1 rounded-full bg-slate-100`}
          >
            <Ionicons name="close" size={13} color="#64748B" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // ── Expanded Matching Products Dropdown ──
  return (
    <Animated.View
      style={[
        tw`absolute top-14 left-0 right-0 z-50 bg-white rounded-t-lg rounded-b-3xl border border-slate-100 p-4 shadow-2xl`,
        {
          opacity: opacityAnim,
          transform: [
            { translateY: translateYAnim },
            { scale: scaleAnim },
          ],
        },
        Platform.OS === 'android'
          ? { elevation: 20 }
          : {
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.18,
              shadowRadius: 20,
            },
      ]}
    >
      {/* Header bar with Match Count and Close Button */}
      <View style={tw`flex-row justify-between items-center pb-2.5 mb-2 border-b border-slate-50`}>
        <View style={tw`flex-row items-center gap-1.5`}>
          <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
          <Text style={tw`text-[11px] font-black text-slate-800 uppercase tracking-wider`}>
            Suggestions ({matchingProducts.length})
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={tw`p-1 rounded-full bg-slate-100`}
        >
          <Ionicons name="close" size={14} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={tw`max-h-72`}
      >
        {matchingProducts.map((product) => {
          const inCartItem = cart.find((i) => i.id === product.id);
          const inCartQty = inCartItem?.quantity || 0;
          const prodImg = resolveImageUrl(product.imageUrls?.[0] || product.image || product.imageUrl);

          return (
            <View
              key={product.id}
              style={tw`flex-row items-center justify-between py-2 border-b border-slate-50`}
            >
              <TouchableOpacity
                onPress={() => onSelectSuggestion(product.name)}
                style={tw`flex-row items-center gap-2.5 flex-1 mr-2`}
                activeOpacity={0.7}
              >
                <View style={tw`w-10 h-10 rounded-2xl bg-slate-50 items-center justify-center border border-slate-100 overflow-hidden`}>
                  {prodImg ? (
                    <Image
                      source={{ uri: prodImg }}
                      style={tw`w-full h-full`}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={tw`w-full h-full bg-slate-50`} />
                  )}
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-xs font-black text-slate-900`} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={tw`text-[10px] font-semibold text-slate-400`}>
                    ₹{product.price} • {product.weight}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Quick Add Button */}
              <TouchableOpacity
                onPress={() => addToCart(product)}
                style={[
                  tw`px-3 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm`,
                  inCartQty > 0
                    ? tw`bg-emerald-50 border border-emerald-300`
                    : { backgroundColor: theme.colors.primary },
                ]}
                activeOpacity={0.8}
              >
                {inCartQty > 0 ? (
                  <>
                    <Ionicons name="checkmark-circle" size={13} color="#059669" />
                    <Text style={tw`text-[10px] font-black text-emerald-800`}>
                      {inCartQty} in cart
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="add" size={13} color="#FFFFFF" />
                    <Text style={tw`text-[10px] font-black text-white uppercase`}>
                      Add
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
};
