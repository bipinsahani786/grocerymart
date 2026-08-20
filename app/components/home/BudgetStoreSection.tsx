import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Product } from '../../data/groceryData';
import { ProductCard } from '../ProductCard';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface BudgetStoreSectionProps {
  products: Product[];
  onProductPress?: (product: Product) => void;
}

export const BudgetStoreSection: React.FC<BudgetStoreSectionProps> = ({ products, onProductPress }) => {
  const [activeTier, setActiveTier] = useState<number>(99);

  const tiers = [
    { label: 'Under ₹49', max: 49 },
    { label: 'Under ₹99', max: 99 },
    { label: 'Under ₹199', max: 199 },
  ];

  const filtered = products
    .filter((p) => p.price <= activeTier)
    .slice(0, 8);

  if (filtered.length === 0) return null;

  return (
    <View style={tw`mb-6 px-4`}>
      {/* Section Title & Subtitle */}
      <View style={tw`flex-row justify-between items-center mb-2.5`}>
        <View>
          <View style={tw`flex-row items-center gap-1.5`}>
            <Text style={tw`text-sm`}>💰</Text>
            <Text style={[tw`text-sm font-black tracking-tight`, { color: theme.colors.text }]}>
              Budget Corner
            </Text>
          </View>
          <Text style={tw`text-[10px] font-bold text-slate-400 mt-0.5`}>
            Pocket-friendly daily essentials
          </Text>
        </View>
      </View>

      {/* Tier Filter Pills */}
      <View style={tw`flex-row gap-2 mb-3`}>
        {tiers.map((tier) => {
          const isSelected = activeTier === tier.max;
          return (
            <TouchableOpacity
              key={tier.max}
              onPress={() => setActiveTier(tier.max)}
              activeOpacity={0.8}
              style={[
                tw`px-3 py-1.5 rounded-full border shadow-sm`,
                isSelected
                  ? tw`bg-emerald-600 border-emerald-600`
                  : tw`bg-white border-slate-200`,
              ]}
            >
              <Text
                style={[
                  tw`text-[10px] font-black uppercase tracking-wider`,
                  isSelected ? tw`text-white` : tw`text-slate-600`,
                ]}
              >
                {tier.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4 Cards Per Row Grid */}
      <View style={tw`flex-row flex-wrap justify-between`}>
        {filtered.map((product) => (
          <View key={`budget-${product.id}`} style={{ width: '23.5%', marginBottom: 10 }}>
            <ProductCard product={product} isMini={true} onPress={onProductPress} />
          </View>
        ))}
      </View>
    </View>
  );
};
