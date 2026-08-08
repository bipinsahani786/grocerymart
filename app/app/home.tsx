import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CartProvider } from '../context/CartContext';
import { theme } from '../constants/theme';
import { products } from '../data/groceryData';
import { Header } from '../components/Header';
import { OfferBanner } from '../components/OfferBanner';
import { CategoryList } from '../components/CategoryList';
import { ProductCard } from '../components/ProductCard';
import { CartFooter } from '../components/CartFooter';

function MainApp() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true); // default true for homepage

  // Filter products based on selected category and search query
  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === 'all' || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={theme.colors.cardBackground} />
      <View style={styles.container}>
        <Header
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          isLoggedIn={isLoggedIn}
          onToggleLogin={() => setIsLoggedIn((prev) => !prev)}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Active Offers */}
          <OfferBanner />

          {/* Categories */}
          <CategoryList
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Products List Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all'
                ? 'Popular Items'
                : `${products.find((p) => p.category === selectedCategory)?.emoji || ''} Fresh ${
                    selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                  }`}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {filteredProducts.length} items available
            </Text>
          </View>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <View style={styles.grid}>
              {filteredProducts.map((product) => (
                <View key={product.id} style={styles.gridCol}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No items match your search</Text>
              <Text style={styles.emptySubtitle}>Try searching for something else</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 110, // Gives space so the bottom CartFooter doesn't overlap items
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg - 6,
    paddingTop: theme.spacing.xs,
  },
  gridCol: {
    width: Platform.OS === 'web' ? '25%' : '50%', // Responsive grid sizes: 4 columns on web, 2 columns on mobile
    minWidth: 160,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});
