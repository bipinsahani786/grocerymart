import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  BackHandler,
  TextInput,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { Header } from '../components/Header';
import { OfferBanner } from '../components/OfferBanner';
import { CategoryList } from '../components/CategoryList';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { SearchView } from '../components/SearchView';
import { CustomCurvedNavBar, TabKey } from '../components/CustomCurvedNavBar';
import { CartView } from '../components/CartView';
import { ProfileView } from '../components/ProfileView';
import { Footer } from '../components/Footer';
import { FloatingCartBar } from '../components/FloatingCartBar';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../context/AuthContext';
import { productService } from '../services/product.service';
import { Product } from '../data/groceryData';
import { useCart } from '../context/CartContext';
import tw from 'twrnc';

/**
 * Single Responsibility & High Performance Shell:
 * Production-level persistent tab navigator housing Home, Search, Cart, and Profile
 * with zero reload flashes, persistent BNB-27 navigation bar, and instant tab switching.
 */
function MainApp() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { fulfillmentMode, selectedStore, pincode } = useCart();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const searchInputRef = useRef<TextInput>(null);

  // Stack-based tab navigation history (LIFO stack)
  const [tabStack, setTabStack] = useState<TabKey[]>(['home']);
  const activeTab = tabStack[tabStack.length - 1] || 'home';

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCategorySticky, setIsCategorySticky] = useState(false);
  const [fadeAnim] = useState(() => new Animated.Value(0));

  // Product detail modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  // Search input focus states
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailVisible(true);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isCategorySticky ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isCategorySticky]);

  // Reset sticky category state when switching active tabs to prevent duplicate rendering
  useEffect(() => {
    if (activeTab === 'home') {
      setIsCategorySticky(false);
      fadeAnim.setValue(0);
    }
  }, [activeTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const isLoggedIn = !!user;

  const handleTabPress = (tab: TabKey) => {
    // If user clicks home/profile/cart, dismiss search focus, blur input, and close keyboard
    if (tab !== 'search') {
      Keyboard.dismiss();
      searchInputRef.current?.blur();
      setIsSearchFocused(false);
    }

    if (tab === 'search') {
      // Switch active tab back to home if not already on it
      if (activeTab !== 'home') {
        setTabStack((prev) => {
          const homeIndex = prev.indexOf('home');
          if (homeIndex !== -1) {
            return prev.slice(0, homeIndex + 1);
          }
          return ['home'];
        });
      }
      
      // Scroll to top and focus home search bar input
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 250);
      return;
    }

    if (tab === activeTab) {
      if (tab === 'home') {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
      return;
    }
    // Push new tab onto stack
    setTabStack((prev) => [...prev, tab]);
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setDebouncedSearchQuery(query);
    setIsSearchFocused(false);
    Keyboard.dismiss();
    searchInputRef.current?.blur();
    
    // Explicitly transition to the dedicated search view tab
    setTabStack((prev) => [...prev.filter(t => t !== 'search'), 'search']);
  };

  const handleBack = () => {
    // Reset search states when navigating back to home catalog
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setIsSearchFocused(false);
    Keyboard.dismiss();
    searchInputRef.current?.blur();
    
    if (tabStack.length > 1) {
      setTabStack((prev) => prev.slice(0, prev.length - 1));
      return true;
    }
    return false;
  };

  // Hardware / System back button listener
  useEffect(() => {
    const onBackPress = () => {
      if (tabStack.length > 1) {
        handleBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [tabStack]);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y > 330) {
      if (!isCategorySticky) setIsCategorySticky(true);
    } else {
      if (isCategorySticky) setIsCategorySticky(false);
    }
  };

  // Note: Search results are updated on explicit submission (Enter press / suggestion select) rather than typing.

  // Derive active pincode based on fulfillment mode details
  const activePincode = fulfillmentMode === 'delivery' 
    ? pincode 
    : (selectedStore?.address ? pincode : undefined);
  const activeStoreId = selectedStore?.id;

  // Query products via productService
  const { data: allFilteredProducts = [], isLoading } = useQuery({
    queryKey: ['products', selectedCategory, debouncedSearchQuery, activePincode, activeStoreId],
    queryFn: () =>
      productService.fetchProducts({ 
        category: selectedCategory, 
        search: debouncedSearchQuery, 
        pincode: activePincode,
        storeId: activeStoreId,
      }),
    staleTime: 1000 * 60 * 2,
  });

  // Query popular products via productService
  const { data: popularProducts = [] } = useQuery({
    queryKey: ['popular-products', activePincode, activeStoreId],
    queryFn: () => productService.fetchProducts({ category: 'all', pincode: activePincode, storeId: activeStoreId }).then(list => list.filter(p => p.rating >= 4.8)),
    staleTime: 1000 * 60 * 5,
  });

  // Infinite Scroll Pagination
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const itemsPerPage = 12;

  // Reset pagination when category or search changes
  useEffect(() => {
    setPage(1);
    setDisplayedProducts(allFilteredProducts.slice(0, itemsPerPage));
  }, [allFilteredProducts]);

  const handleLoadMore = () => {
    if (isPaginationLoading || displayedProducts.length >= allFilteredProducts.length) {
      return;
    }

    setIsPaginationLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const nextBatch = allFilteredProducts.slice(0, nextPage * itemsPerPage);
      setDisplayedProducts(nextBatch);
      setPage(nextPage);
      setIsPaginationLoading(false);
    }, 400);
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" translucent />
      <View style={[tw`flex-1 relative`, { backgroundColor: theme.colors.background }]}>
        
        {/* ── Active Tab View Rendering (Instant zero-flash switching with LIFO history stack) ── */}
        {activeTab === 'profile' ? (
          <ProfileView onBack={handleBack} />
        ) : activeTab === 'cart' ? (
          <CartView onShopMore={handleBack} onBack={handleBack} />
        ) : activeTab === 'search' ? (
          <SearchView
            onBack={handleBack}
            initialQuery={searchQuery}
            onNavigateToCart={() => handleTabPress('cart')}
          />
        ) : (
          /* Home Catalog View */
          <>
            {isSearchFocused && (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  Keyboard.dismiss();
                  searchInputRef.current?.blur();
                  setIsSearchFocused(false);
                }}
                style={tw`absolute inset-0 bg-black/30 z-35`}
              />
            )}
            {/* Floating Header & Sticky Category Bar */}
            <View style={[tw`absolute top-0 left-0 right-0 z-40`]}>
              <Header
                searchQuery={searchQuery}
                onSearchQueryChange={(text) => {
                  setSearchQuery(text);
                }}
                onSearchFocus={() => {
                  setIsSearchFocused(true);
                }}
                onSearchBlur={() => {
                  setIsSearchFocused(false);
                }}
                onSubmitSearch={handleSearchSubmit}
                isLoggedIn={isLoggedIn}
                onToggleLogin={() => {
                  if (isLoggedIn) {
                    handleTabPress('profile');
                  } else {
                    router.push('/login');
                  }
                }}
                isSticky={isCategorySticky}
                onCartPress={() => handleTabPress('cart')}
                searchInputRef={searchInputRef}
              />
              <Animated.View
                pointerEvents={isCategorySticky ? 'auto' : 'none'}
                style={[
                  tw`shadow-md border-b border-slate-100`,
                  {
                    backgroundColor: theme.colors.cardBackground,
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-15, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <CategoryList
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  isSticky={true}
                />
              </Animated.View>
            </View>

            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[tw`pb-36`, { paddingBottom: Math.max(insets.bottom, 16) + 110 }]}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {/* Visual Hero Banner */}
              <View style={[tw`relative z-20`, { elevation: 10 }]}>
                <OfferBanner />
              </View>

              {/* Categories Bar */}
              <View style={tw`mb-4`}>
                <CategoryList
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </View>

              {/* Featured Popular Section */}
              {selectedCategory === 'all' && !searchQuery && (
                <View style={tw`mb-5`}>
                  <View style={tw`flex-row justify-between items-center px-4 mb-2`}>
                    <View style={tw`flex-row items-center gap-1.5`}>
                      <Text style={tw`text-base`}>🔥</Text>
                      <Text style={[tw`text-sm font-black tracking-tight`, { color: theme.colors.text }]}>
                        Trending This Week
                      </Text>
                    </View>
                    <Text style={[tw`text-[11px] font-black uppercase tracking-wider`, { color: theme.colors.primary }]}>
                      Top Rated
                    </Text>
                  </View>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={popularProducts.length > 0 ? popularProducts : allFilteredProducts.slice(0, 5)}
                    keyExtractor={(item) => `pop-${item.id}`}
                    renderItem={({ item }) => (
                      <View style={[tw`ml-4`, { width: 160 }]}>
                        <ProductCard product={item} onPress={handleProductPress} />
                      </View>
                    )}
                    contentContainerStyle={tw`pr-4`}
                  />
                </View>
              )}

              {/* Main Products Grid */}
              <View style={tw`px-4`}>
                <View style={tw`flex-row justify-between items-center mb-3`}>
                  <View>
                    <Text style={[tw`text-sm font-black uppercase tracking-wider`, { color: theme.colors.text }]}>
                      {searchQuery.trim().length > 0
                        ? `Search: "${searchQuery}"`
                        : (selectedCategory === 'all' ? 'All Groceries' : `${selectedCategory}`)}
                    </Text>
                    <Text style={[tw`text-[10px] font-bold mt-0.5`, { color: theme.colors.textMuted }]}>
                      Showing {displayedProducts.length} of {allFilteredProducts.length} items
                    </Text>
                  </View>
                  {searchQuery.trim().length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setSearchQuery('');
                        setDebouncedSearchQuery('');
                      }}
                      style={tw`px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 flex-row items-center gap-1`}
                    >
                      <Ionicons name="close" size={12} color="#64748B" />
                      <Text style={tw`text-[10px] font-bold text-slate-600`}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {isLoading ? (
                  <View style={tw`py-12 items-center justify-center`}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[tw`text-xs font-bold mt-3`, { color: theme.colors.textMuted }]}>
                      Loading fresh groceries...
                    </Text>
                  </View>
                ) : displayedProducts.length === 0 ? (
                  <View style={tw`py-16 items-center justify-center bg-white rounded-3xl border border-slate-100 mt-2`}>
                    <Text style={tw`text-4xl mb-3`}>🔍</Text>
                    <Text style={[tw`text-base font-black`, { color: theme.colors.text }]}>No products found</Text>
                    <Text style={[tw`text-xs text-center px-8 mt-1`, { color: theme.colors.textMuted }]}>
                      Try adjusting your search query or selecting a different category.
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={tw`flex-row flex-wrap justify-between`}>
                      {displayedProducts.map((product) => (
                        <View key={product.id} style={{ width: '23.8%', marginBottom: 8 }}>
                          <ProductCard product={product} isMini={true} onPress={handleProductPress} />
                        </View>
                      ))}
                    </View>

                    {/* Pagination Load More Button */}
                    {displayedProducts.length < allFilteredProducts.length && (
                      <View style={tw`mt-4 items-center`}>
                        <TouchableOpacity
                          onPress={handleLoadMore}
                          disabled={isPaginationLoading}
                          style={[
                            tw`px-6 py-3 rounded-full flex-row items-center gap-2 border border-slate-200 bg-white shadow-sm`,
                          ]}
                        >
                          {isPaginationLoading ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                          ) : (
                            <>
                              <Text style={[tw`text-xs font-black uppercase tracking-wider`, { color: theme.colors.primary }]}>
                                Load More Products
                              </Text>
                              <Text style={tw`text-xs text-slate-400 font-bold`}>
                                ({allFilteredProducts.length - displayedProducts.length} remaining)
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* Branded Trust & Customer Care Footer */}
              <Footer />
            </ScrollView>
          </>
        )}

        {/* ── Floating Sticky Mini-Cart Bar (Shown on any page when cart has items) ── */}
        <FloatingCartBar
          onPress={() => handleTabPress('cart')}
          visible={activeTab !== 'cart'}
        />

        {/* ── Persistent Fluid Organic Curved Bottom Navigation Bar (BNB-27) ── */}
        <CustomCurvedNavBar activeTab={activeTab === 'search' || isSearchFocused ? 'search' : activeTab} onTabPress={handleTabPress} />
      </View>

      <ProductDetailModal
        product={selectedProduct}
        visible={isDetailVisible}
        onClose={() => setIsDetailVisible(false)}
        onNavigateToCart={() => handleTabPress('cart')}
        onPressProduct={(p) => setSelectedProduct(p)}
      />
    </View>
  );
}

export default function Home() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}
