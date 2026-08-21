import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../data/groceryData';
import { ProductCard } from '../ProductCard';
import tw from 'twrnc';

interface FlashDealsSectionProps {
  products: Product[];
  onProductPress?: (product: Product) => void;
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({ products, onProductPress }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = products.length > 0
    ? products.slice(0, 8)
    : [];

  if (dealProducts.length === 0) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <View style={tw`mb-6 bg-rose-50/70 py-4 border-t border-b border-rose-100`}>
      {/* Header with Timer */}
      <View style={tw`flex-row justify-between items-center px-4 mb-3`}>
        <View style={tw`flex-row items-center gap-2`}>
          <View style={tw`bg-rose-600 px-2.5 py-1 rounded-lg flex-row items-center gap-1 shadow-sm`}>
            <Ionicons name="flash" size={11} color="#FFFFFF" />
            <Text style={tw`text-[10px] font-black text-white uppercase tracking-wider`}>FLASH DEALS</Text>
          </View>
          <Text style={tw`text-xs font-black text-slate-800 tracking-tight`}>Limited Steals</Text>
        </View>

        {/* Countdown Timer Pill */}
        <View style={tw`flex-row items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-rose-200 shadow-sm`}>
          <Ionicons name="timer-outline" size={12} color="#E11D48" />
          <Text style={tw`text-[10px] font-black text-rose-600 font-mono`}>
            {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
          </Text>
        </View>
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-4`}
      >
        {dealProducts.map((product) => (
          <View key={`flash-${product.id}`} style={[tw`mr-3`, { width: 142 }]}>
            <ProductCard product={product} isMini={true} onPress={onProductPress} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
