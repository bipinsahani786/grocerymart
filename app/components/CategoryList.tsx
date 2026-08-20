import React from 'react';
import { Text, ScrollView, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { useCart } from '../context/CartContext';
import { Category } from '../data/groceryData';
import { resolveImageUrl } from '../utils/image';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import tw from 'twrnc';

interface CategoryListProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  isSticky?: boolean;
}

// Curated pastel color palette system based on index/slug for visual hierarchy
const PALETTE = [
  { bg: '#ECFDF5', activeBg: '#10B981', text: '#059669', activeText: '#FFFFFF' }, // Emerald
  { bg: '#EFF6FF', activeBg: '#3B82F6', text: '#2563EB', activeText: '#FFFFFF' }, // Blue
  { bg: '#FFFBEB', activeBg: '#F59E0B', text: '#D97706', activeText: '#FFFFFF' }, // Amber
  { bg: '#F5F3FF', activeBg: '#8B5CF6', text: '#7C3AED', activeText: '#FFFFFF' }, // Purple
  { bg: '#FEF2F2', activeBg: '#EF4444', text: '#DC2626', activeText: '#FFFFFF' }, // Rose
  { bg: '#FFF7ED', activeBg: '#F97316', text: '#EA580C', activeText: '#FFFFFF' }, // Orange
  { bg: '#F0FDF4', activeBg: '#16A34A', text: '#15803D', activeText: '#FFFFFF' }, // Green
  { bg: '#F8FAFC', activeBg: '#475569', text: '#334155', activeText: '#FFFFFF' }, // Slate
];

export const CategoryList: React.FC<CategoryListProps> = ({
  selectedCategory,
  onSelectCategory,
  isSticky = false,
}) => {
  const { pincode, fulfillmentMode, selectedStore } = useCart();

  const activePincode = fulfillmentMode === 'delivery'
    ? pincode
    : (selectedStore?.address ? pincode : undefined);
  const activeStoreId = selectedStore?.id;

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['customer-categories', activePincode, activeStoreId],
    queryFn: () => productService.fetchCategories({ pincode: activePincode, storeId: activeStoreId }),
    staleTime: 1000 * 60 * 2,
  });

  return (
    <View style={[tw`py-2`, { backgroundColor: isSticky ? theme.colors.cardBackground : 'transparent' }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-3 pb-1`}
      >
        {isLoading ? (
          // Loading skeleton pills
          <View style={tw`flex-row items-center py-2 px-3 gap-2`}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={tw`text-[11px] font-bold text-slate-400`}>Loading categories...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={tw`flex-row items-center py-2 px-4 bg-slate-100/90 rounded-2xl border border-slate-200/80 mx-2 gap-2`}>
            <Text style={tw`text-xs font-bold text-slate-600`}>No categories found</Text>
          </View>
        ) : (
          categories.map((category, index) => {
            const isSelected = category.id === selectedCategory || (selectedCategory === 'all' && category.id === 'all');
            const colors = PALETTE[index % PALETTE.length];
            
            const bgStyle = isSelected ? colors.activeBg : colors.bg;
            const borderStyle = isSelected ? 'transparent' : 'rgba(229, 231, 235, 0.7)';
            const textColor = isSelected ? colors.activeText : colors.text;
            const catImage = resolveImageUrl(category.image || category.imageUrl);

            return (
              <TouchableOpacity
                key={category.id || index}
                style={[
                  tw`items-center justify-center mx-1.5 py-2 px-3 rounded-2xl border min-w-[78px] shadow-sm`,
                  { 
                    backgroundColor: bgStyle, 
                    borderColor: borderStyle,
                    shadowColor: isSelected && !isSticky ? '#000' : 'transparent',
                    elevation: isSelected ? 2 : 0,
                  }
                ]}
                onPress={() => onSelectCategory(category.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    tw`w-14 h-14 rounded-2xl items-center justify-center mb-1.5 bg-white shadow-sm overflow-hidden border border-slate-100/80`,
                  ]}
                >
                  {category.id === 'all' ? (
                    <View style={tw`w-full h-full items-center justify-center bg-emerald-50`}>
                      <Ionicons name="apps" size={26} color="#059669" />
                    </View>
                  ) : catImage ? (
                    <Image
                      source={{ uri: catImage }}
                      style={tw`w-full h-full`}
                      resizeMode="cover"
                    />
                  ) : (
                    /* Clean fallback if no image */
                    <View style={tw`w-full h-full bg-slate-100/60 items-center justify-center`}>
                      <Ionicons name="bag-handle-outline" size={22} color="#94A3B8" />
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    tw`text-[11px] font-black tracking-wider uppercase`,
                    { color: textColor }
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};
