import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Product } from '../../data/groceryData';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface BrandStorefrontSectionProps {
  products: Product[];
  selectedBrand?: string | null;
  onSelectBrand?: (brand: string) => void;
}

export const BrandStorefrontSection: React.FC<BrandStorefrontSectionProps> = ({
  products,
  selectedBrand,
  onSelectBrand,
}) => {
  // Extract unique real brands from database products
  const brandMap = new Map<string, number>();
  products.forEach((p) => {
    if (p.brand && p.brand.trim().length > 0) {
      const b = p.brand.trim();
      brandMap.set(b, (brandMap.get(b) || 0) + 1);
    }
  });

  const brands = Array.from(brandMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  if (brands.length === 0) return null;

  return (
    <View style={tw`mb-6 px-4`}>
      <View style={tw`flex-row justify-between items-center mb-3`}>
        <View style={tw`flex-row items-center gap-1.5`}>
          <Text style={tw`text-sm`}>🏷️</Text>
          <Text style={[tw`text-sm font-black tracking-tight`, { color: theme.colors.text }]}>
            Top Official Brands
          </Text>
        </View>
        <Text style={[tw`text-[10px] font-black uppercase tracking-wider`, { color: theme.colors.primary }]}>
          Verified
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`py-1`}
      >
        {brands.map((b) => {
          const isSelected = selectedBrand === b.name;
          const initials = b.name.slice(0, 2).toUpperCase();

          return (
            <TouchableOpacity
              key={b.name}
              onPress={() => onSelectBrand && onSelectBrand(b.name)}
              activeOpacity={0.8}
              style={[
                tw`mr-3 items-center p-2.5 rounded-2xl border bg-white shadow-sm min-w-[80px]`,
                isSelected ? tw`border-emerald-600 bg-emerald-50/50` : tw`border-slate-200/80`,
              ]}
            >
              {/* Brand Avatar Circle */}
              <View
                style={[
                  tw`w-12 h-12 rounded-full items-center justify-center mb-1.5 border`,
                  isSelected ? tw`bg-emerald-600 border-emerald-700` : tw`bg-slate-100 border-slate-200`,
                ]}
              >
                <Text
                  style={[
                    tw`text-xs font-black tracking-wider`,
                    isSelected ? tw`text-white` : tw`text-slate-700`,
                  ]}
                >
                  {initials}
                </Text>
              </View>

              <Text
                style={[
                  tw`text-[11px] font-black text-center`,
                  isSelected ? tw`text-emerald-800` : tw`text-slate-800`,
                ]}
                numberOfLines={1}
              >
                {b.name}
              </Text>
              <Text style={tw`text-[9px] font-bold text-slate-400 mt-0.5`}>
                {b.count} {b.count === 1 ? 'item' : 'items'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
