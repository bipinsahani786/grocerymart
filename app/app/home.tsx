import React, { useState } from 'react';
import { Text, View, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from '../context/CartContext';
import { theme } from '../constants/theme';
import { products } from '../data/groceryData';
import { Header } from '../components/Header';
import { OfferBanner } from '../components/OfferBanner';
import { CategoryList } from '../components/CategoryList';
import { ProductCard } from '../components/ProductCard';
import { CartFooter } from '../components/CartFooter';
import tw from 'twrnc';

function MainApp() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const isLoggedIn = true; // default true for homepage

  // Filter products based on selected category and search query
  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === 'all' || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const gridColStyle = Platform.OS === 'web' ? tw`w-1/4 min-w-[160px]` : tw`w-1/2 min-w-[160px]`;

  const router = useRouter();

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-[110px]`}
        >
          {/* Active Offers */}
          <OfferBanner />

          {/* Categories */}
          <CategoryList
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Products List Title */}
          <View style={[tw`px-4 pt-3 pb-1`, { backgroundColor: theme.colors.background }]}>
            <Text style={[tw`text-lg font-black`, { color: theme.colors.text }]}>
              {selectedCategory === 'all'
                ? 'Popular Items'
                : `${products.find((p) => p.category === selectedCategory)?.emoji || ''} Fresh ${
                    selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                  }`}
            </Text>
            <Text style={[tw`text-xs mt-0.5`, { color: theme.colors.textMuted }]}>
              {filteredProducts.length} items available
            </Text>
          </View>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <View style={tw`flex-row flex-wrap px-2.5 pt-1`}>
              {filteredProducts.map((product) => (
                <View key={product.id} style={gridColStyle}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          ) : (
            <View style={tw`items-center justify-center py-12 px-5`}>
              <Text style={tw`text-[48px] mb-2`}>🔍</Text>
              <Text style={[tw`text-base font-bold mb-1`, { color: theme.colors.text }]}>No items match your search</Text>
              <Text style={[tw`text-xs`, { color: theme.colors.textMuted }]}>Try searching for something else</Text>
            </View>
          )}
        </ScrollView>

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
