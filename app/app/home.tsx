import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from '../context/CartContext';
import { theme } from '../constants/theme';
import { products as localProductData } from '../data/groceryData';
import { Header } from '../components/Header';
import { OfferBanner } from '../components/OfferBanner';
import { CategoryList } from '../components/CategoryList';
import { ProductCard } from '../components/ProductCard';
import { CartFooter } from '../components/CartFooter';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import tw from 'twrnc';

// Simulated Backend API Client that fetches products page-by-page.
// In a real app, this would perform a fetch request to `API_URL/api/products?page=${page}&limit=${limit}&category=${category}&search=${search}`
const fetchProductsApi = async (category: string, search: string): Promise<typeof localProductData> => {
  // Simulate network latency (250ms)
  await new Promise((resolve) => setTimeout(resolve, 250));

  // Perform backend-like filtering
  return localProductData.filter(
    (product) =>
      (category === 'all' || product.category === category) &&
      product.name.toLowerCase().includes(search.toLowerCase())
  );
};

function MainApp() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const isLoggedIn = true; // default true for homepage

  // 1. React Query integration for automatic memory caching & state management
  const { data: allFilteredProducts = [], isLoading } = useQuery({
    queryKey: ['products', selectedCategory, searchQuery],
    queryFn: () => fetchProductsApi(selectedCategory, searchQuery),
    staleTime: 1000 * 60 * 5, // Keep cache fresh for 5 minutes
  });

  // 2. Infinite Scroll Pagination states
  const [displayedProducts, setDisplayedProducts] = useState<typeof localProductData>([]);
  const [page, setPage] = useState(1);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const itemsPerPage = 6; // Low number to easily demonstrate scroll pagination

  // Reset pagination when category or search changes
  useEffect(() => {
    setPage(1);
    setDisplayedProducts(allFilteredProducts.slice(0, itemsPerPage));
  }, [allFilteredProducts]);

  // Load next chunk of products on scroll end
  const handleLoadMore = () => {
    if (isPaginationLoading || displayedProducts.length >= allFilteredProducts.length) {
      return;
    }

    setIsPaginationLoading(true);
    // Simulate loading next page of products (150ms delay)
    setTimeout(() => {
      const nextPage = page + 1;
      const nextProducts = allFilteredProducts.slice(0, nextPage * itemsPerPage);
      setDisplayedProducts(nextProducts);
      setPage(nextPage);
      setIsPaginationLoading(false);
    }, 150);
  };

  const gridColStyle = Platform.OS === 'web' ? tw`w-1/4 min-w-[160px]` : tw`w-1/2 min-w-[160px]`;

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.colors.cardBackground }]}>
      <StatusBar style="dark" backgroundColor={theme.colors.cardBackground} />
      <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
        <Header
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          isLoggedIn={isLoggedIn}
          onToggleLogin={() => router.push('/profile')}
        />

        {/* 3. Performance-Optimized FlatList replacing heavy nested ScrollView */}
        <FlatList
          data={displayedProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={tw`flex-row justify-start px-1.5`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-[120px]`}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            <View>
              {/* Active Offers */}
              <OfferBanner />

              {/* Categories Selector */}
              <CategoryList
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* Products List Title */}
              <View style={[tw`px-4 pt-4 pb-2`, { backgroundColor: theme.colors.background }]}>
                <Text style={[tw`text-lg font-black`, { color: theme.colors.text }]}>
                  {selectedCategory === 'all'
                    ? 'Popular Items'
                    : `${localProductData.find((p) => p.category === selectedCategory)?.emoji || ''} Fresh ${
                        selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                      }`}
                </Text>
                <Text style={[tw`text-xs mt-0.5`, { color: theme.colors.textMuted }]}>
                  {allFilteredProducts.length} items available
                </Text>
              </View>

              {isLoading && (
                <View style={tw`py-8 justify-center items-center`}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[tw`text-xs font-semibold mt-2`, { color: theme.colors.textMuted }]}>Loading fresh picks...</Text>
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View style={gridColStyle}>
              <ProductCard product={item} />
            </View>
          )}
          ListEmptyComponent={
            !isLoading ? (
              <View style={tw`items-center justify-center py-12 px-5`}>
                <Text style={tw`text-[48px] mb-2`}>🔍</Text>
                <Text style={[tw`text-base font-bold mb-1`, { color: theme.colors.text }]}>
                  No items match your search
                </Text>
                <Text style={[tw`text-xs`, { color: theme.colors.textMuted }]}>
                  Try searching for something else
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            isPaginationLoading ? (
              <View style={tw`py-4 justify-center items-center`}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
        />

        {/* Dynamic Sticky Bottom Cart */}
        <CartFooter />
      </View>
    </View>
  );
}

export default function Home() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </SafeAreaProvider>
  );
}
