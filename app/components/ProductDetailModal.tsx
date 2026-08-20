import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Platform, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Product } from '../data/groceryData';
import { productService } from '../services/product.service';
import { ProductCard } from './ProductCard';
import { FloatingCartBar } from './FloatingCartBar';
import { useCart } from '../context/CartContext';
import { useSavedItems } from '../context/SavedItemsContext';
import { resolveImageUrl } from '../utils/image';
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

type TabType = 'details' | 'specs' | 'delivery';

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  visible,
  onClose,
  onNavigateToCart,
  onPressProduct,
}) => {
  const { cart, addToCart, removeFromCart, pincode } = useCart();
  const { isSaved, toggleSaveItem } = useSavedItems();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const imageCarouselRef = useRef<ScrollView>(null);

  // Reset tab, variant, and carousel when product changes
  useEffect(() => {
    if (product) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      imageCarouselRef.current?.scrollTo({ x: 0, animated: false });
      setActiveTab('details');
      setActiveImageIndex(0);
      setSelectedVariantId(product.variants && product.variants.length > 0 ? product.variants[0].id : null);
    }
  }, [product?.id]);

  const { data: categoryProducts = [] } = useQuery<Product[]>({
    queryKey: ['products', product?.category, pincode],
    queryFn: () => productService.fetchProducts({ category: product?.category, pincode }),
    enabled: !!product?.category,
  });

  const handleCartPress = () => {
    onClose();
    if (onNavigateToCart) {
      onNavigateToCart();
    }
  };

  if (!product) return null;

  // Selected variant resolution (if product has variants)
  const selectedVariant = (product.variants || []).find((v) => v.id === selectedVariantId);
  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeMrp = selectedVariant ? (selectedVariant.mrp || selectedVariant.price * 1.25) : (product.mrp || product.price * 1.25);
  const hasDiscount = activeMrp > activePrice;
  const discountPercent = hasDiscount ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : 0;

  // Extract all real product images from backend / R2
  const rawImages = (product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0)
    ? product.imageUrls
    : (product.image || product.imageUrl ? [product.image || product.imageUrl!] : []);

  const validImages: string[] = rawImages
    .map((img) => resolveImageUrl(img))
    .filter((img): img is string => typeof img === 'string' && img.length > 0);

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // Real related products in the same category
  const relatedProducts = categoryProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 6);

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
          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-36`}>
            
            {/* 1. Large Image Backdrop / Multi-Image Carousel */}
            <View style={tw`relative w-full h-80 bg-slate-50 items-center justify-center overflow-hidden border-b border-slate-100`}>
              {/* Heart/Like float circle */}
              <TouchableOpacity
                onPress={() => product && toggleSaveItem(product)}
                activeOpacity={0.8}
                style={[
                  tw`absolute z-50 w-10 h-10 rounded-full border justify-center items-center shadow-sm`,
                  isSaved(product.id) ? tw`bg-rose-50 border-rose-200` : tw`bg-white/90 border-slate-200`,
                  { top: 16, left: 16 },
                ]}
              >
                <Ionicons
                  name={isSaved(product.id) ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isSaved(product.id) ? '#E11D48' : '#64748B'}
                />
              </TouchableOpacity>

              {/* Close Float Button */}
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                style={[
                  tw`absolute z-50 w-10 h-10 rounded-full bg-white/90 border border-slate-200 justify-center items-center shadow-sm`,
                  { top: 16, right: 16 },
                ]}
              >
                <Ionicons name="close" size={20} color="#1E293B" />
              </TouchableOpacity>

              {/* Central multi-image Carousel or Single image or Blank */}
              {validImages.length > 1 ? (
                <View style={tw`w-full h-full`}>
                  <ScrollView
                    ref={imageCarouselRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                      const offset = e.nativeEvent.contentOffset.x;
                      const newIndex = Math.round(offset / width);
                      setActiveImageIndex(newIndex);
                    }}
                    style={tw`w-full h-full`}
                  >
                    {validImages.map((imgUri, index) => (
                      <View
                        key={index}
                        style={{ width, height: 320, justifyContent: 'center', alignItems: 'center' }}
                      >
                        <Image
                          source={{ uri: imgUri }}
                          style={tw`w-full h-full`}
                          resizeMode="contain"
                        />
                      </View>
                    ))}
                  </ScrollView>

                  {/* Carousel Pagination Indicator */}
                  <View
                    style={[
                      tw`absolute flex-row items-center justify-center gap-1.5 bg-black/50 px-3 py-1 rounded-full z-40`,
                      { top: 18, alignSelf: 'center' },
                    ]}
                  >
                    {validImages.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          tw`h-1.5 rounded-full`,
                          i === activeImageIndex ? tw`w-4 bg-white` : tw`w-1.5 bg-white/50`,
                        ]}
                      />
                    ))}
                    <Text style={tw`text-[10px] font-black text-white ml-1`}>
                      {activeImageIndex + 1}/{validImages.length}
                    </Text>
                  </View>
                </View>
              ) : validImages.length === 1 ? (
                <Image
                  source={{ uri: validImages[0] }}
                  style={tw`w-full h-full`}
                  resizeMode="contain"
                />
              ) : (
                <View style={tw`w-full h-full bg-slate-50 items-center justify-center`}>
                  <Ionicons name="image-outline" size={48} color="#CBD5E1" />
                </View>
              )}

              {/* Bottom Badges Overlay */}
              <View style={tw`absolute bottom-4 flex-row gap-2 px-4`}>
                <View style={tw`px-3 py-1 rounded-full bg-white/95 border border-slate-200 shadow-sm flex-row items-center gap-1`}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={tw`text-[10px] font-black text-slate-800`}>{Number(product.rating || 4.5).toFixed(1)} Rating</Text>
                </View>
                {product.outOfStock ? (
                  <View style={tw`px-3 py-1 rounded-full bg-rose-50 border border-rose-200 shadow-sm flex-row items-center gap-1`}>
                    <Ionicons name="alert-circle" size={12} color="#E11D48" />
                    <Text style={tw`text-[10px] font-black text-rose-700`}>Out of Stock</Text>
                  </View>
                ) : (
                  <View style={tw`px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm flex-row items-center gap-1`}>
                    <Ionicons name="checkmark-circle" size={12} color="#059669" />
                    <Text style={tw`text-[10px] font-black text-emerald-700`}>In Stock</Text>
                  </View>
                )}
              </View>
            </View>

            {/* 2. Product Header Details */}
            <View style={tw`px-6 pt-5`}>
              {/* Brand & Category badges */}
              <View style={tw`flex-row items-center gap-2 mb-2`}>
                {product.brand ? (
                  <View style={tw`px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200`}>
                    <Text style={tw`text-[11px] font-black text-emerald-800 uppercase tracking-wider`}>
                      {product.brand}
                    </Text>
                  </View>
                ) : null}
                <View style={tw`px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200`}>
                  <Text style={tw`text-[11px] font-bold text-slate-600`}>
                    {product.categoryName || product.category}
                  </Text>
                </View>
              </View>

              {/* Product Title */}
              <Text style={[tw`text-2xl font-black tracking-tight leading-8 mb-1`, { color: theme.colors.text }]}>
                {product.name}
              </Text>

              {/* Net Quantity / Unit */}
              <Text style={tw`text-sm font-bold text-slate-400 mb-3`}>
                {product.weight || product.unit || '1 unit'}
              </Text>

              {/* Live Price & Discount calculation */}
              <View style={tw`flex-row items-baseline gap-2.5 mb-4`}>
                <Text style={[tw`text-2xl font-black`, { color: theme.colors.text }]}>
                  ₹{activePrice.toFixed(0)}
                </Text>
                {hasDiscount && (
                  <>
                    <Text style={tw`text-base font-bold text-slate-400 line-through`}>
                      ₹{activeMrp.toFixed(0)}
                    </Text>
                    <View style={tw`px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200`}>
                      <Text style={tw`text-[10px] font-black text-emerald-800`}>
                        {discountPercent}% OFF
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Real Product Variants (if available) */}
              {product.variants && product.variants.length > 0 && (
                <View style={tw`mb-5`}>
                  <Text style={tw`text-xs font-black text-slate-700 uppercase tracking-wider mb-2`}>
                    Select Pack / Size
                  </Text>
                  <View style={tw`flex-row flex-wrap gap-2`}>
                    {product.variants.map((v) => {
                      const isSelected = v.id === selectedVariantId;
                      return (
                        <TouchableOpacity
                          key={v.id}
                          onPress={() => setSelectedVariantId(v.id)}
                          activeOpacity={0.8}
                          style={[
                            tw`px-3 py-2 rounded-xl border flex-row items-center gap-2`,
                            isSelected
                              ? tw`bg-emerald-50 border-emerald-600`
                              : tw`bg-white border-slate-200`,
                          ]}
                        >
                          <Text style={[tw`text-xs font-black`, isSelected ? tw`text-emerald-800` : tw`text-slate-700`]}>
                            {v.name}
                          </Text>
                          <Text style={[tw`text-xs font-bold`, isSelected ? tw`text-emerald-700` : tw`text-slate-500`]}>
                            ₹{v.price.toFixed(0)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* 3. Tabbed Navigation */}
              <View style={tw`flex-row border-b border-slate-100 w-full mt-2 mb-4`}>
                {[
                  { id: 'details', label: 'Details' },
                  { id: 'specs', label: 'Specifications' },
                  { id: 'delivery', label: 'Store & Delivery' },
                ].map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id as TabType)}
                    style={[
                      tw`flex-1 pb-3 items-center`,
                      activeTab === tab.id ? tw`border-b-2 border-emerald-600` : null,
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-xs font-black uppercase tracking-wider`,
                        activeTab === tab.id ? tw`text-emerald-700` : tw`text-slate-400`,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 4. Tab Panels */}
              {activeTab === 'details' && (
                <View style={tw`mb-6`}>
                  <Text style={[tw`text-sm font-black mb-2`, { color: theme.colors.text }]}>
                    Product Description
                  </Text>
                  <Text style={[tw`text-xs leading-5 font-medium text-slate-600 mb-4`]}>
                    {product.description && product.description.trim().length > 0
                      ? product.description
                      : 'No additional description provided for this product.'}
                  </Text>

                  {/* Highlights Grid */}
                  <View style={tw`bg-slate-50 border border-slate-100 rounded-2xl p-3.5 gap-2.5`}>
                    <View style={tw`flex-row justify-between items-center`}>
                      <Text style={tw`text-xs text-slate-500 font-bold`}>Category</Text>
                      <Text style={tw`text-xs font-black text-slate-800`}>{product.categoryName || product.category}</Text>
                    </View>
                    <View style={tw`flex-row justify-between items-center`}>
                      <Text style={tw`text-xs text-slate-500 font-bold`}>Unit / Weight</Text>
                      <Text style={tw`text-xs font-black text-slate-800`}>{product.weight || product.unit || 'Standard'}</Text>
                    </View>
                    {product.brand ? (
                      <View style={tw`flex-row justify-between items-center`}>
                        <Text style={tw`text-xs text-slate-500 font-bold`}>Brand</Text>
                        <Text style={tw`text-xs font-black text-slate-800`}>{product.brand}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              )}

              {activeTab === 'specs' && (
                <View style={tw`mb-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl`}>
                  <Text style={[tw`text-sm font-black mb-3`, { color: theme.colors.text }]}>
                    Product Attributes
                  </Text>
                  
                  <View style={tw`gap-2.5`}>
                    <View style={tw`flex-row justify-between items-center border-b border-slate-200/60 pb-2`}>
                      <Text style={tw`text-xs text-slate-500 font-semibold`}>Product ID / SKU</Text>
                      <Text style={tw`text-xs font-mono font-bold text-slate-800`}>
                        {product.sku || product.id.slice(0, 12).toUpperCase()}
                      </Text>
                    </View>

                    {product.barcode ? (
                      <View style={tw`flex-row justify-between items-center border-b border-slate-200/60 pb-2`}>
                        <Text style={tw`text-xs text-slate-500 font-semibold`}>Barcode / EAN</Text>
                        <Text style={tw`text-xs font-mono font-bold text-slate-800`}>{product.barcode}</Text>
                      </View>
                    ) : null}

                    {product.hsnCode ? (
                      <View style={tw`flex-row justify-between items-center border-b border-slate-200/60 pb-2`}>
                        <Text style={tw`text-xs text-slate-500 font-semibold`}>HSN Code</Text>
                        <Text style={tw`text-xs font-mono font-bold text-slate-800`}>{product.hsnCode}</Text>
                      </View>
                    ) : null}

                    <View style={tw`flex-row justify-between items-center border-b border-slate-200/60 pb-2`}>
                      <Text style={tw`text-xs text-slate-500 font-semibold`}>Product Type</Text>
                      <Text style={tw`text-xs font-black text-slate-800 capitalize`}>{product.productType || 'Simple'}</Text>
                    </View>

                    <View style={tw`flex-row justify-between items-center`}>
                      <Text style={tw`text-xs text-slate-500 font-semibold`}>Inventory Stock</Text>
                      <Text style={[tw`text-xs font-black`, product.outOfStock ? tw`text-rose-600` : tw`text-emerald-700`]}>
                        {product.outOfStock ? 'Out of Stock' : (product.stock ? `${product.stock} units in stock` : 'In Stock')}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {activeTab === 'delivery' && (
                <View style={tw`mb-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl gap-3`}>
                  <Text style={[tw`text-sm font-black mb-1`, { color: theme.colors.text }]}>
                    Fulfillment Information
                  </Text>

                  <View style={tw`flex-row items-center gap-3 border-b border-slate-200/60 pb-3`}>
                    <View style={tw`w-8 h-8 rounded-full bg-emerald-100 items-center justify-center`}>
                      <Ionicons name="storefront" size={16} color="#047857" />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-xs font-black text-slate-800`}>Sold by Store Partner</Text>
                      <Text style={tw`text-[11px] text-slate-500 font-medium`}>
                        {product.storeName || 'Verified GroceryMart Partner Store'}
                      </Text>
                    </View>
                  </View>

                  <View style={tw`flex-row items-center gap-3 border-b border-slate-200/60 pb-3`}>
                    <View style={tw`w-8 h-8 rounded-full bg-blue-100 items-center justify-center`}>
                      <Ionicons name="bicycle" size={16} color="#1D4ED8" />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-xs font-black text-slate-800`}>Doorstep Delivery</Text>
                      <Text style={tw`text-[11px] text-slate-500 font-medium`}>
                        {product.availableForDelivery !== false ? 'Standard Fast Delivery (10-15 mins)' : 'Not available for home delivery'}
                      </Text>
                    </View>
                  </View>

                  <View style={tw`flex-row items-center gap-3`}>
                    <View style={tw`w-8 h-8 rounded-full bg-amber-100 items-center justify-center`}>
                      <Ionicons name="bag-check" size={16} color="#B45309" />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={tw`text-xs font-black text-slate-800`}>Store Pickup (Click & Collect)</Text>
                      <Text style={tw`text-[11px] text-slate-500 font-medium`}>
                        {product.availableForClickCollect !== false ? 'Available for quick counter pickup' : 'Not available for counter pickup'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* 5. Real Related Products Carousel */}
              {relatedProducts.length > 0 && (
                <View style={tw`mt-2 mb-4`}>
                  <Text style={[tw`text-sm font-black mb-3`, { color: theme.colors.text }]}>
                    More in {product.categoryName || product.category}
                  </Text>
                  
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={tw`pr-6 py-1`}
                  >
                    {relatedProducts.map((p) => (
                      <View key={p.id} style={[tw`mr-3`, { width: 140 }]}>
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

          {/* 6. Sticky Bottom Action Bar */}
          <View
            style={[
              tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex-row justify-between items-center z-50 shadow-xl`,
              Platform.OS === 'ios' ? { paddingBottom: 28 } : null,
            ]}
          >
            {/* Price section */}
            <View>
              <Text style={[tw`text-2xl font-black`, { color: theme.colors.text }]}>
                ₹{activePrice.toFixed(0)}
              </Text>
              <Text style={tw`text-[10px] text-slate-400 font-bold`}>
                {hasDiscount ? `MRP ₹${activeMrp.toFixed(0)}` : 'Inclusive of all taxes'}
              </Text>
            </View>

            {/* Cart adjustments */}
            <View>
              {quantity > 0 ? (
                <View style={tw`flex-row items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1.5 shadow-sm`}>
                  <TouchableOpacity
                    onPress={() => removeFromCart(product.id)}
                    style={tw`px-3 py-1`}
                  >
                    <Ionicons name="remove" size={16} color="#047857" />
                  </TouchableOpacity>
                  <Text style={tw`text-sm font-black text-emerald-800 px-2`}>{quantity}</Text>
                  <TouchableOpacity
                    onPress={() => addToCart(product)}
                    style={tw`px-3 py-1`}
                  >
                    <Ionicons name="add" size={16} color="#047857" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => addToCart(product)}
                  disabled={product.outOfStock}
                  style={[
                    tw`flex-row items-center px-6 py-3 rounded-full shadow-md justify-center`,
                    product.outOfStock
                      ? tw`bg-slate-300`
                      : { backgroundColor: theme.colors.primary, minWidth: 150 },
                  ]}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={tw`font-black text-xs ml-1 text-white uppercase tracking-wider`}>
                    {product.outOfStock ? 'Out of Stock' : 'Add to Basket'}
                  </Text>
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
