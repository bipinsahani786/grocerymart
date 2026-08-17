import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, products } from '../data/groceryData';
import { ProductCard } from './ProductCard';
import { FloatingCartBar } from './FloatingCartBar';
import { useCart } from '../context/CartContext';
import { theme } from '../constants/theme';
import tw from 'twrnc';

const { width } = Dimensions.get('window');

interface ProductDetailModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onNavigateToCart?: () => void;
  onPressProduct?: (product: Product) => void;
}

type TabType = 'overview' | 'nutrition' | 'sourcing';

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  visible,
  onClose,
  onNavigateToCart,
  onPressProduct,
}) => {
  const { cart, addToCart, removeFromCart } = useCart();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top and reset tab when product ID changes
  useEffect(() => {
    if (product) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      setActiveTab('overview');
    }
  }, [product?.id]);

  const handleCartPress = () => {
    onClose();
    if (onNavigateToCart) {
      onNavigateToCart();
    }
  };

  if (!product) return null;

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // Fetch related products in the same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 5);

  // Category specific styles
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'fruits':
        return {
          bg: 'bg-rose-50/80',
          ring: 'border-rose-100/80 bg-rose-100/40',
          glow: 'bg-rose-400/10',
          badgeBg: 'bg-rose-50 border border-rose-100',
          badgeText: 'text-rose-700',
          label: 'Fresh Fruits',
        };
      case 'vegetables':
        return {
          bg: 'bg-emerald-50/80',
          ring: 'border-emerald-100/80 bg-emerald-100/40',
          glow: 'bg-emerald-400/10',
          badgeBg: 'bg-emerald-50 border border-emerald-100',
          badgeText: 'text-emerald-700',
          label: 'Organic Veggies',
        };
      case 'dairy':
        return {
          bg: 'bg-sky-50/80',
          ring: 'border-sky-100/80 bg-sky-100/40',
          glow: 'bg-sky-400/10',
          badgeBg: 'bg-sky-50 border border-sky-100',
          badgeText: 'text-sky-700',
          label: 'Dairy & Eggs',
        };
      case 'bakery':
        return {
          bg: 'bg-amber-50/80',
          ring: 'border-amber-100/80 bg-amber-100/40',
          glow: 'bg-amber-400/10',
          badgeBg: 'bg-amber-50 border border-amber-100',
          badgeText: 'text-amber-700',
          label: 'Breads & Bakery',
        };
      case 'beverages':
        return {
          bg: 'bg-blue-50/80',
          ring: 'border-blue-100/80 bg-blue-100/40',
          glow: 'bg-blue-400/10',
          badgeBg: 'bg-blue-50 border border-blue-100',
          badgeText: 'text-blue-700',
          label: 'Beverages',
        };
      case 'snacks':
        return {
          bg: 'bg-indigo-50/80',
          ring: 'border-indigo-100/80 bg-indigo-100/40',
          glow: 'bg-indigo-400/10',
          badgeBg: 'bg-indigo-50 border border-indigo-100',
          badgeText: 'text-indigo-700',
          label: 'Snacks & Munchies',
        };
      default:
        return {
          bg: 'bg-slate-50/80',
          ring: 'border-slate-100/80 bg-slate-100/40',
          glow: 'bg-slate-400/10',
          badgeBg: 'bg-slate-50 border border-slate-100',
          badgeText: 'text-slate-700',
          label: 'Grocery',
        };
    }
  };

  const catTheme = getCategoryTheme(product.category);

  // Mock Nutrition Facts based on category
  const getNutritionFacts = (category: string) => {
    switch (category) {
      case 'fruits':
      case 'vegetables':
        return { calories: '45 kcal', carbs: '10g', proteins: '0.8g', fat: '0.1g', vitamin: 'Vitamin C (80%)' };
      case 'dairy':
        return { calories: '120 kcal', carbs: '4.8g', proteins: '8.2g', fat: '3.6g', vitamin: 'Calcium (30%)' };
      case 'bakery':
        return { calories: '240 kcal', carbs: '45g', proteins: '7.5g', fat: '2.2g', vitamin: 'Iron (12%)' };
      case 'beverages':
        return { calories: '60 kcal', carbs: '14g', proteins: '0.1g', fat: '0.0g', vitamin: 'Hydration (100%)' };
      case 'snacks':
        return { calories: '180 kcal', carbs: '22g', proteins: '3.4g', fat: '9.5g', vitamin: 'Fiber (8%)' };
      default:
        return { calories: '95 kcal', carbs: '12g', proteins: '2.5g', fat: '1.8g', vitamin: 'Minerals (15%)' };
    }
  };

  const nutrition = getNutritionFacts(product.category);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-black/60 justify-end`}>
        {/* Backdrop dismissable area */}
        <TouchableOpacity
          style={tw`absolute inset-0`}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Sheet Container */}
        <View
          style={[
            tw`bg-white rounded-t-[36px] w-full max-h-[92%] flex-col overflow-hidden shadow-2xl`,
            Platform.OS === 'ios' ? { paddingBottom: 20 } : null,
          ]}
        >
          {/* Scrollable details */}
          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-32`}>
            
            {/* 1. Large Visual Curved Backdrop Section */}
            <View style={[tw`relative w-full h-82 items-center justify-center overflow-hidden border-b border-slate-100`, tw`${catTheme.bg}`]}>
              {/* Abstract Glowing Rings in Backdrop */}
              <View style={[tw`absolute rounded-full border items-center justify-center`, tw`${catTheme.ring}`, { width: 280, height: 280 }]} />
              <View style={[tw`absolute rounded-full border items-center justify-center`, tw`${catTheme.ring}`, { width: 190, height: 190 }]} />
              <View style={[tw`absolute rounded-full blur-xl`, tw`${catTheme.glow}`, { width: 120, height: 120 }]} />

              {/* Close float circle (Glassmorphic blur look) */}
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                style={[
                  tw`absolute z-50 w-11 h-11 rounded-full bg-white/80 border border-slate-200 justify-center items-center shadow-sm`,
                  { top: 20, right: 20 },
                ]}
              >
                <Ionicons name="close" size={22} color="#1E293B" />
              </TouchableOpacity>

              {/* Heart/Like float circle */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  tw`absolute z-50 w-11 h-11 rounded-full bg-white border border-slate-100 justify-center items-center shadow-sm`,
                  { top: 20, left: 20 },
                ]}
              >
                <Ionicons name="heart" size={21} color="#E11D48" />
              </TouchableOpacity>

              {/* Central high resolution emoji */}
              <Text style={{ fontSize: 135 }}>{product.emoji}</Text>

              {/* Floating detail tag overlays */}
              <View style={tw`absolute bottom-5 flex-row gap-2`}>
                <View style={tw`px-3 py-1.5 rounded-full bg-white border border-slate-100 shadow-2xs flex-row items-center gap-1`}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={tw`text-[10px] font-black text-slate-800`}>{product.rating} (120+ reviews)</Text>
                </View>
                <View style={tw`px-3 py-1.5 rounded-full bg-white border border-slate-100 shadow-2xs flex-row items-center gap-1`}>
                  <Ionicons name="shield-checkmark" size={12} color="#059669" />
                  <Text style={tw`text-[10px] font-black text-slate-800`}>100% Chilled Transit</Text>
                </View>
              </View>
            </View>

            {/* 2. Brand & Title Details Container */}
            <View style={tw`px-6 pt-5`}>
              <View style={tw`flex-row items-center justify-between mb-2.5`}>
                <View style={[tw`px-3 py-1 rounded-full`, tw`${catTheme.badgeBg}`]}>
                  <Text style={[tw`text-[10px] font-black uppercase tracking-wider`, tw`${catTheme.badgeText}`]}>
                    {catTheme.label}
                  </Text>
                </View>
                <View style={tw`flex-row items-center bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100`}>
                  <Ionicons name="leaf" size={10} color="#059669" />
                  <Text style={tw`text-[9px] font-black text-emerald-700 uppercase tracking-wider ml-1`}>
                    Farm Fresh
                  </Text>
                </View>
              </View>

              <Text style={[tw`text-2xl font-black tracking-tight leading-8 mb-1`, { color: theme.colors.text }]}>
                {product.name}
              </Text>
              <Text style={tw`text-sm font-black text-slate-400`}>{product.weight}</Text>

              {/* 3. Redesigned Tabbed Navigation Selector */}
              <View style={tw`flex-row border-b border-slate-100 w-full mt-6 mb-4`}>
                {(['overview', 'nutrition', 'sourcing'] as TabType[]).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[
                      tw`flex-1 pb-3 items-center`,
                      activeTab === tab ? tw`border-b-2 border-emerald-600` : null
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-xs font-black uppercase tracking-wider`,
                        activeTab === tab ? tw`text-emerald-700` : tw`text-slate-400`
                      ]}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 4. Tab Panels */}
              {activeTab === 'overview' && (
                <View style={tw`mb-6`}>
                  <Text style={[tw`text-sm font-black mb-2`, { color: theme.colors.text }]}>
                    Overview & Description
                  </Text>
                  <Text style={[tw`text-xs leading-5 font-medium mb-5`, { color: theme.colors.textMuted }]}>
                    {product.description || `Enjoy premium fresh, farm-sourced ${product.name.toLowerCase()} selected carefully for high quality, nutritional value, and great taste. Cleaned, pre-washed, and sanitarily packed.`}
                  </Text>

                  {/* 2x2 Feature Dashboard Grid */}
                  <View style={tw`flex-row flex-wrap justify-between gap-y-2`}>
                    <View style={tw`w-[48.5%] bg-slate-50 border border-slate-100 p-3 rounded-2xl flex-row items-center gap-2.5`}>
                      <Ionicons name="sparkles-outline" size={16} color="#059669" />
                      <View>
                        <Text style={tw`text-[10px] font-black text-slate-800`}>100% Organic</Text>
                        <Text style={tw`text-[8px] text-slate-400 font-bold`}>Zero pesticide chemicals</Text>
                      </View>
                    </View>
                    <View style={tw`w-[48.5%] bg-slate-50 border border-slate-100 p-3 rounded-2xl flex-row items-center gap-2.5`}>
                      <Ionicons name="shield-checkmark-outline" size={16} color="#059669" />
                      <View>
                        <Text style={tw`text-[10px] font-black text-slate-800`}>Safety Certified</Text>
                        <Text style={tw`text-[8px] text-slate-400 font-bold`}>Multi-stage sorting checks</Text>
                      </View>
                    </View>
                    <View style={tw`w-[48.5%] bg-slate-50 border border-slate-100 p-3 rounded-2xl flex-row items-center gap-2.5`}>
                      <Ionicons name="bicycle-outline" size={16} color="#059669" />
                      <View>
                        <Text style={tw`text-[10px] font-black text-slate-800`}>Express Delivery</Text>
                        <Text style={tw`text-[8px] text-slate-400 font-bold`}>Cold transit in 12 mins</Text>
                      </View>
                    </View>
                    <View style={tw`w-[48.5%] bg-slate-50 border border-slate-100 p-3 rounded-2xl flex-row items-center gap-2.5`}>
                      <Ionicons name="sync-outline" size={16} color="#059669" />
                      <View>
                        <Text style={tw`text-[10px] font-black text-slate-800`}>Easy Door Return</Text>
                        <Text style={tw`text-[8px] text-slate-400 font-bold`}>No questions asked policy</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {activeTab === 'nutrition' && (
                <View style={tw`mb-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl`}>
                  <Text style={[tw`text-sm font-black mb-3`, { color: theme.colors.text }]}>
                    Nutritional Content (Per 100g)
                  </Text>
                  
                  <View style={tw`gap-2.5`}>
                    <View style={tw`flex-row justify-between items-center border-b border-slate-200/50 pb-1.5`}>
                      <Text style={tw`text-xs text-slate-500 font-semibold`}>Energy / Calories</Text>
                      <Text style={tw`text-xs font-black text-slate-800`}>{nutrition.calories}</Text>
                    </View>
                    <View style={tw`flex-row justify-between items-center border-b border-slate-200/50 pb-1.5`}>
                      <Text style={tw`text-xs text-slate-500 font-semibold`}>Carbohydrates</Text>
                      <Text style={tw`text-xs font-black text-slate-800`}>{nutrition.carbs}</Text>
                    </View>
                    <View style={tw`flex-row justify-between items-center border-b border-slate-200/50 pb-1.5`}>
                      <Text style={tw`text-xs text-slate-500 font-semibold`}>Proteins</Text>
                      <Text style={tw`text-xs font-black text-slate-800`}>{nutrition.proteins}</Text>
                    </View>
                    <View style={tw`flex-row justify-between items-center border-b border-slate-200/50 pb-1.5`}>
                      <Text style={tw`text-xs text-slate-500 font-semibold`}>Fats</Text>
                      <Text style={tw`text-xs font-black text-slate-800`}>{nutrition.fat}</Text>
                    </View>
                    <View style={tw`flex-row justify-between items-center`}>
                      <Text style={tw`text-xs text-slate-500 font-semibold`}>Key Vitamin / Mineral</Text>
                      <Text style={tw`text-xs font-black text-slate-800`}>{nutrition.vitamin}</Text>
                    </View>
                  </View>
                </View>
              )}

              {activeTab === 'sourcing' && (
                <View style={tw`mb-6`}>
                  <Text style={[tw`text-sm font-black mb-4`, { color: theme.colors.text }]}>
                    Farm to Table Timeline
                  </Text>
                  
                  {/* Sourcing Timeline Stepper */}
                  <View style={tw`pl-4 relative border-l-2 border-slate-100 gap-5`}>
                    {/* Step 1 */}
                    <View style={tw`relative pl-4`}>
                      <View style={[tw`absolute -left-6 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white`, { top: 2 }]} />
                      <Text style={tw`text-xs font-black text-slate-800`}>Harvested</Text>
                      <Text style={tw`text-[10px] text-slate-400 font-semibold mt-0.5`}>Harvested fresh from verified local organic farms (NYC regional farm cooperative)</Text>
                    </View>
                    {/* Step 2 */}
                    <View style={tw`relative pl-4`}>
                      <View style={[tw`absolute -left-6 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white`, { top: 2 }]} />
                      <Text style={tw`text-xs font-black text-slate-800`}>Sanitation & Quality Sorting</Text>
                      <Text style={tw`text-[10px] text-slate-400 font-semibold mt-0.5`}>Passed multi-stage ozone washing, sanitizing, and grading checks to match export quality</Text>
                    </View>
                    {/* Step 3 */}
                    <View style={tw`relative pl-4`}>
                      <View style={[tw`absolute -left-6 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white`, { top: 2 }]} />
                      <Text style={tw`text-xs font-black text-slate-800`}>Express Chilled Packing</Text>
                      <Text style={tw`text-[10px] text-slate-400 font-semibold mt-0.5`}>Sorted into temperature-controlled cooling hubs and sealed in insulated transit boxes</Text>
                    </View>
                    {/* Step 4 */}
                    <View style={tw`relative pl-4`}>
                      <View style={[tw`absolute -left-6 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white`, { top: 2 }]} />
                      <Text style={tw`text-xs font-black text-slate-800`}>Fast Doorstep Delivery</Text>
                      <Text style={tw`text-[10px] text-slate-400 font-semibold mt-0.5`}>Delivered to your kitchen counters fresh in 12 minutes through our hyper-local riders</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* 5. Related Products Recommendation Carousel */}
              {relatedProducts.length > 0 && (
                <View style={tw`mt-4 mb-2`}>
                  <Text style={[tw`text-sm font-black mb-3`, { color: theme.colors.text }]}>
                    You might also like
                  </Text>
                  
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={tw`pr-6 py-1`}
                  >
                    {relatedProducts.map((p) => (
                      <View key={p.id} style={[tw`mr-3`, { width: 135 }]}>
                        <ProductCard
                          product={p}
                          isMini={true}
                          onPress={onPressProduct}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>

          {/* 6. Sticky Bottom Control Bar */}
          <View
            style={[
              tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100/80 px-6 py-4.5 flex-row justify-between items-center z-50 shadow-lg`,
              Platform.OS === 'ios' ? { paddingBottom: 28 } : null,
            ]}
          >
            {/* Price section */}
            <View>
              <Text style={[tw`text-2xl font-black`, { color: theme.colors.text }]}>
                ₹{product.price.toFixed(0)}
              </Text>
              <Text style={tw`text-[10px] text-slate-400 font-bold mt-0.5`}>Inclusive of all taxes</Text>
            </View>

            {/* Cart adjustments */}
            <View>
              {quantity > 0 ? (
                <View style={tw`flex-row items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-2 shadow-2xs`}>
                  <TouchableOpacity
                    onPress={() => removeFromCart(product.id)}
                    style={tw`px-3 py-1.5`}
                  >
                    <Ionicons name="remove" size={16} color="#047857" />
                  </TouchableOpacity>
                  <Text style={tw`text-sm font-black text-emerald-800 px-3`}>{quantity}</Text>
                  <TouchableOpacity
                    onPress={() => addToCart(product)}
                    style={tw`px-3 py-1.5`}
                  >
                    <Ionicons name="add" size={16} color="#047857" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => addToCart(product)}
                  style={[
                    tw`flex-row items-center px-7 py-3.5 rounded-full shadow-md justify-center`,
                    { backgroundColor: theme.colors.primary, minWidth: 160 },
                  ]}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={[tw`font-extrabold text-xs ml-1 text-white uppercase tracking-wider`]}>Add to Basket</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Floating Cart Bar summary pill inside modal */}
          {onNavigateToCart && (
            <FloatingCartBar onPress={handleCartPress} />
          )}
        </View>
      </View>
    </Modal>
  );
};
