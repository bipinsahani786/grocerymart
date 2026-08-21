import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, TextInput, Keyboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchHeader } from './search/SearchHeader';
import { SearchFilterBar, ViewMode, ActiveFilter } from './search/SearchFilterBar';
import { SearchLandingView } from './search/SearchLandingView';
import { SearchGridCard } from './search/SearchGridCard';
import { SearchListCard } from './search/SearchListCard';
import { SearchEmptyState } from './search/SearchEmptyState';
import { ProductDetailModal } from './ProductDetailModal';
import { FloatingCartBar } from './FloatingCartBar';
import { theme } from '../constants/theme';
import { Product } from '../data/groceryData';
import { productService } from '../services/product.service';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import tw from 'twrnc';

interface SearchViewProps {
  onBack: () => void;
  initialQuery?: string;
  onNavigateToCart?: () => void;
}

const POPULAR_SEARCH_TAGS = [
  'Milk', 'Paneer', 'Eggs', 'Fresh Bread', 'Tomatoes', 'Amul Butter',
  'Onion', 'Basmati Rice', 'Sunflower Oil', 'Apples', 'Maggi', 'Biscuits'
];

/**
 * Modular SearchView Orchestrator:
 * - Pure separation of concerns
 * - SearchHeader, SearchFilterBar, SearchGridCard (4-in-a-row), SearchListCard, SearchLandingView, SearchEmptyState
 */
export const SearchView: React.FC<SearchViewProps> = ({
  onBack,
  initialQuery = '',
  onNavigateToCart,
}) => {
  const searchInputRef = useRef<TextInput>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');

  const { pincode } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setSubmittedQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (submittedQuery.trim().length === 0) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [submittedQuery]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch (e) {
      console.log('Error loading recent searches', e);
    }
  };

  const saveSearchTerm = async (term: string) => {
    if (!term || term.trim().length === 0) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter((t) => t !== cleanTerm)].slice(0, 6);
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

  const { data: rawSearchResults = [], isLoading } = useQuery<Product[]>({
    queryKey: ['search-products', submittedQuery, pincode],
    queryFn: () =>
      productService.fetchProducts({
        category: 'all',
        search: submittedQuery,
        pincode: pincode,
      }),
    enabled: submittedQuery.trim().length > 0,
  });

  const filteredProducts = useMemo(() => {
    const list = Array.isArray(rawSearchResults) ? [...rawSearchResults] : [];

    if (activeFilter === 'under99') {
      return list.filter((p) => Number(p?.price || 0) <= 99);
    } else if (activeFilter === 'high_rated') {
      return list.filter((p) => Number(p?.rating || 0) >= 4.5);
    } else if (activeFilter === 'price_low') {
      return list.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
    }

    return list;
  }, [rawSearchResults, activeFilter]);

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

  return (
    <View style={tw`flex-1 bg-[#F8FAFC]`}>
      <StatusBar style="light" backgroundColor="#047857" translucent />

      {/* 1. Header with Search Input & 10-15 Min ETA */}
      <SearchHeader
        onBack={onBack}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSubmitSearch={(query) => {
          setSubmittedQuery(query);
          saveSearchTerm(query);
        }}
        onClear={() => {
          setSearchQuery('');
          setSubmittedQuery('');
        }}
        searchInputRef={searchInputRef}
        resultCount={filteredProducts.length}
        hasSubmittedQuery={submittedQuery.trim().length > 0}
      />

      {/* 2. Filter Bar (4-Grid vs List View + Filter Chips) */}
      {submittedQuery.trim().length > 0 && !isLoading && rawSearchResults.length > 0 && (
        <SearchFilterBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      )}

      {/* 3. Main Body */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-32`}
        style={tw`flex-1`}
      >
        {submittedQuery.trim().length === 0 ? (
          <SearchLandingView
            recentSearches={recentSearches}
            onSelectSearch={handleQuickSearch}
            onClearRecent={clearRecentSearches}
            popularTags={POPULAR_SEARCH_TAGS}
          />
        ) : isLoading ? (
          <View style={tw`py-28 justify-center items-center`}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : filteredProducts.length === 0 ? (
          <SearchEmptyState
            query={submittedQuery}
            onSelectSuggested={handleQuickSearch}
          />
        ) : viewMode === 'grid' ? (
          /* 4-Cards Direct Grid View */
          <View style={tw`px-2.5 pt-3`}>
            <View style={tw`flex-row flex-wrap justify-between`}>
              {filteredProducts.map((product, index) => (
                <View
                  key={product?.id || `grid-${index}`}
                  style={{
                    width: '23.6%',
                    marginBottom: 8,
                  }}
                >
                  <SearchGridCard
                    product={product}
                    onPress={handleProductPress}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* Detailed Horizontal List View */
          <View style={tw`px-3 pt-3 gap-2.5`}>
            {filteredProducts.map((product, index) => (
              <SearchListCard
                key={product?.id || `list-${index}`}
                product={product}
                onPress={handleProductPress}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Mini Cart */}
      {onNavigateToCart && (
        <FloatingCartBar onPress={onNavigateToCart} />
      )}

      {/* Product Detail Modal */}
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
