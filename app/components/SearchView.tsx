import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Keyboard, TextInput, Platform, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchBar } from './SearchBar';
import { ProductDetailModal } from './ProductDetailModal';
import { FloatingCartBar } from './FloatingCartBar';
import { theme } from '../constants/theme';
import { Product } from '../data/groceryData';
import { productService } from '../services/product.service';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../utils/image';
import tw from 'twrnc';

interface SearchViewProps {
  onBack: () => void;
  initialQuery?: string;
  onNavigateToCart?: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onBack, initialQuery = '', onNavigateToCart }) => {
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<TextInput>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Cart integration
  const { cart, addToCart, removeFromCart, fulfillmentMode, selectedStore, pincode } = useCart();

  // Detail Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setSubmittedQuery(initialQuery);
    }
  }, [initialQuery]);

  // Autofocus input ONLY when there is no pre-existing query (landing fresh on search page)
  useEffect(() => {
    if (submittedQuery.trim().length === 0) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, []);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.log('Error loading recent searches', e);
    }
  };

  const saveSearchTerm = async (term: string) => {
    if (!term || term.trim().length === 0) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter(t => t !== cleanTerm)].slice(0, 5);
    setRecentSearches(updated);
    try {
      await AsyncStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.log('Error saving search term', e);
    }
  };

  const clearRecentSearches = async () => {
    setRecentSearches([]);
    try {
      await AsyncStorage.removeItem('recent_searches');
    } catch (e) {
      console.log('Error clearing recent searches', e);
    }
  };

  const activePincode = pincode;

  // Fetch filtered products based on search term
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search-products', submittedQuery, activePincode],
    queryFn: () => productService.fetchProducts({ 
      category: 'all', 
      search: submittedQuery, 
      pincode: activePincode 
    }),
    enabled: submittedQuery.trim().length > 0,
  });

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailVisible(true);
  };

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    setSubmittedQuery(term);
    saveSearchTerm(term);
    Keyboard.dismiss();
  };

  // Category Theme Mapper
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'fruits':
        return { bg: 'bg-rose-50/70', badgeBg: 'bg-rose-50 border-rose-100', badgeText: 'text-rose-700', label: 'Fresh Fruits' };
      case 'vegetables':
        return { bg: 'bg-emerald-50/70', badgeBg: 'bg-emerald-50 border-emerald-100', badgeText: 'text-emerald-700', label: 'Organic Veggies' };
      case 'dairy':
        return { bg: 'bg-sky-50/70', badgeBg: 'bg-sky-50 border-sky-100', badgeText: 'text-sky-700', label: 'Dairy & Eggs' };
      case 'bakery':
        return { bg: 'bg-amber-50/70', badgeBg: 'bg-amber-50 border-amber-100', badgeText: 'text-amber-700', label: 'Breads & Bakery' };
      case 'beverages':
        return { bg: 'bg-blue-50/70', badgeBg: 'bg-blue-50 border-blue-100', badgeText: 'text-blue-700', label: 'Beverages' };
      case 'snacks':
        return { bg: 'bg-indigo-50/70', badgeBg: 'bg-indigo-50 border-indigo-100', badgeText: 'text-indigo-700', label: 'Snacks & Munchies' };
      default:
        return { bg: 'bg-slate-50/70', badgeBg: 'bg-slate-50 border-slate-100', badgeText: 'text-slate-700', label: 'Grocery' };
    }
  };

  return (
    <View style={[tw`flex-1 bg-slate-50`, { paddingTop: Math.max(insets.top, 16) + 14 }]}>
      {/* Dynamic Status Bar Fix (Dark style for visibility on search page) */}
      <StatusBar style="dark" />

      {/* 1. Fully Redesigned Header Bar with extra top margin spacing */}
      <View style={tw`px-4 pb-4 flex-row items-center gap-3 border-b border-slate-100/60 bg-white shadow-sm`}>
        <TouchableOpacity
          onPress={onBack}
          style={tw`w-11 h-11 rounded-full bg-slate-50 border border-slate-100 justify-center items-center`}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>

        <View style={tw`flex-1`}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitSearch={(query) => {
              setSubmittedQuery(query);
              saveSearchTerm(query);
            }}
            onClear={() => {
              setSearchQuery('');
              setSubmittedQuery('');
            }}
            inputRef={searchInputRef}
            customPlaceholder="Search fruits, milk, soap..."
          />
        </View>
      </View>

      {/* 2. Scrollable Body Content */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-28`}
        style={tw`flex-1`}
      >
        {submittedQuery.trim().length === 0 ? (
          /* ──── A. Pre-Search Landing View (Recent Searches) ──── */
          <View style={tw`px-5 pt-6`}>
            {recentSearches.length > 0 ? (
              <>
                <View style={tw`flex-row justify-between items-center mb-3.5`}>
                  <Text style={[tw`text-[11px] font-black uppercase tracking-wider text-slate-400`]}>
                    🕒 Recent Searches
                  </Text>
                  <TouchableOpacity onPress={clearRecentSearches} activeOpacity={0.7}>
                    <Text style={[tw`text-[11px] font-black text-rose-500 uppercase tracking-wider`]}>
                      Clear All
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={tw`flex-row flex-wrap gap-2 mb-6`}>
                  {recentSearches.map((term, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleQuickSearch(term)}
                      style={tw`px-4 py-2.2 bg-white rounded-full border border-slate-100 shadow-sm flex-row items-center gap-1.5`}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="time-outline" size={13} color="#64748B" />
                      <Text style={tw`text-xs font-bold text-slate-700`}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <View style={tw`py-16 justify-center items-center`}>
                <View style={tw`w-14 h-14 bg-slate-100 rounded-full justify-center items-center mb-3`}>
                  <Ionicons name="search" size={24} color="#94A3B8" />
                </View>
                <Text style={tw`text-xs font-bold text-slate-400`}>
                  Type above to start searching groceries
                </Text>
              </View>
            )}
          </View>
        ) : isLoading ? (
          /* ──── B. Loading Indicator ──── */
          <View style={tw`py-24 justify-center items-center`}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={tw`text-xs font-bold text-slate-400 mt-4`}>
              Searching catalog...
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          /* ──── C. No Results View ──── */
          <View style={tw`px-6 py-20 justify-center items-center bg-white rounded-3xl border border-slate-100/60 mx-4 mt-6 shadow-sm`}>
            <Text style={tw`text-5xl mb-4`}>🔍</Text>
            <Text style={[tw`text-base font-black`, { color: theme.colors.text }]}>
              No items match "{submittedQuery}"
            </Text>
            <Text style={[tw`text-xs text-center px-4 mt-1.5 leading-5`, { color: theme.colors.textMuted }]}>
              Double-check spelling or try search terms like "milk", "bread", "apples", or "soap".
            </Text>
          </View>
        ) : (
          /* ──── D. Fully Redesigned Active Search List (Flipkart Style) ──── */
          <View style={tw`px-4 pt-5`}>
            {/* Dedicated Sort & Results Summary Row */}
            <View style={tw`flex-row justify-between items-center mb-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm`}>
              <View>
                <Text style={tw`text-xs font-bold text-slate-400`}>
                  Showing results for
                </Text>
                <Text style={[tw`text-sm font-black`, { color: theme.colors.text }]}>
                  "{submittedQuery}"
                </Text>
              </View>
              <View style={tw`flex-row gap-2`}>
                <View style={tw`px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg flex-row items-center gap-1`}>
                  <Text style={tw`text-[10px] font-black text-slate-600`}>{searchResults.length} Items</Text>
                </View>
                <TouchableOpacity style={tw`px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg flex-row items-center gap-1`}>
                  <Ionicons name="filter" size={10} color="#059669" />
                  <Text style={tw`text-[10px] font-black text-emerald-700`}>Filters</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* List Row items */}
            <View style={tw`gap-3`}>
              {searchResults.map((product) => {
                const cartItem = cart.find((item) => item.id === product.id);
                const quantity = cartItem ? cartItem.quantity : 0;
                const catTheme = getCategoryTheme(product.category);
                
                // Realistic Discount Calculator
                const discountPrice = product.price;
                const originalPrice = Math.round(discountPrice * 1.25);
                
                return (
                  <TouchableOpacity
                    key={product.id}
                    activeOpacity={0.9}
                    onPress={() => handleProductPress(product)}
                    style={tw`flex-row bg-white rounded-3xl p-4 border border-slate-200/80 items-center`}
                  >
                    {/* Left side: Premium Backdrop with Real Image or Blank */}
                    <View style={[tw`w-20 h-20 rounded-2xl items-center justify-center mr-4 overflow-hidden border border-slate-100/80`, tw`${catTheme.bg}`]}>
                      {resolveImageUrl(product.imageUrls?.[0] || product.image || product.imageUrl) ? (
                        <Image
                          source={{ uri: resolveImageUrl(product.imageUrls?.[0] || product.image || product.imageUrl)! }}
                          style={tw`w-full h-full`}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={tw`w-full h-full bg-slate-50`} />
                      )}
                    </View>

                    {/* Center side: Product Details */}
                    <View style={tw`flex-1 justify-center py-0.5`}>
                      <View style={tw`flex-row items-center gap-1.5 mb-1`}>
                        <View style={[tw`px-2 py-0.5 rounded border`, tw`${catTheme.badgeBg}`]}>
                          <Text style={[tw`text-[8px] font-black uppercase tracking-wider`, tw`${catTheme.badgeText}`]}>
                            {catTheme.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={[tw`text-[14px] font-black text-slate-800 leading-5`, { color: theme.colors.text }]} numberOfLines={2}>
                        {product.name}
                      </Text>

                      <Text style={tw`text-[11px] font-bold text-slate-400 mt-0.5`}>{product.weight}</Text>

                      {/* Stars Rating and Reviews */}
                      <View style={tw`flex-row items-center mt-1.5`}>
                        <Ionicons name="star" size={11} color="#F59E0B" />
                        <Text style={tw`text-[10px] font-black text-slate-700 ml-1`}>{Number(product.rating || 4.5).toFixed(1)}</Text>
                        <Text style={tw`text-[10px] text-slate-400 font-bold ml-1.5`}>(120+ ratings)</Text>
                      </View>
                    </View>

                    {/* Right side: Pricing and Cart CTA buttons */}
                    <View style={tw`items-end justify-between min-h-[76px] ml-1`}>
                      <View style={tw`items-end`}>
                        <Text style={[tw`text-[15px] font-black`, { color: theme.colors.text }]}>
                          ₹{discountPrice.toFixed(0)}
                        </Text>
                        <Text style={tw`text-[10px] text-slate-400 font-bold line-through mt-0.5`}>
                          ₹{originalPrice}
                        </Text>
                      </View>

                      {quantity > 0 ? (
                        <View style={tw`flex-row items-center rounded-full border border-emerald-200 bg-emerald-50 px-1 py-0.5 shadow-sm`}>
                          <TouchableOpacity onPress={() => removeFromCart(product.id)} style={tw`p-2`}>
                            <Ionicons name="remove" size={12} color="#047857" />
                          </TouchableOpacity>
                          <Text style={tw`text-xs font-black text-emerald-800 px-1`}>{quantity}</Text>
                          <TouchableOpacity onPress={() => addToCart(product)} style={tw`p-2`}>
                            <Ionicons name="add" size={12} color="#047857" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => addToCart(product)}
                          style={[tw`flex-row items-center px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 shadow-sm`, { borderColor: theme.colors.primary }]}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="add" size={12} color={theme.colors.primary} />
                          <Text style={[tw`font-extrabold text-[10px] ml-0.5`, { color: theme.colors.primary }]}>ADD</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Cart Bar summary pill */}
      {onNavigateToCart && (
        <FloatingCartBar onPress={onNavigateToCart} />
      )}

      {/* Product Detail Modal Sheet */}
      <ProductDetailModal
        product={selectedProduct}
        visible={isDetailVisible}
        onClose={() => setIsDetailVisible(false)}
        onNavigateToCart={onNavigateToCart}
        onPressProduct={(p) => setSelectedProduct(p)}
      />
    </View>
  );
};
