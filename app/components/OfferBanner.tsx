import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { offers } from '../data/groceryData';
import tw from 'twrnc';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // Full width hero banner with small side padding

export const OfferBanner: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / (CARD_WIDTH + 16));
    if (index >= 0 && index < offers.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={[tw`py-4`, { backgroundColor: theme.colors.cardBackground }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={tw`px-4`}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {offers.map((offer) => (
          <TouchableOpacity key={offer.id} activeOpacity={0.95}>
            <LinearGradient
              colors={offer.gradientColors as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                tw`h-52 rounded-3xl mr-4 p-6 justify-between overflow-hidden relative shadow-lg`,
                { width: CARD_WIDTH }
              ]}
            >
              {/* Modern Graphic Abstract Circles in Background */}
              <View style={[tw`absolute rounded-full`, { right: -40, top: -40, width: 200, height: 200, backgroundColor: 'rgba(255, 255, 255, 0.12)' }]} />
              <View style={[tw`absolute rounded-full`, { right: 80, bottom: -60, width: 120, height: 120, backgroundColor: 'rgba(255, 255, 255, 0.08)' }]} />

              <View style={tw`flex-1 justify-between z-10`}>
                {/* Top Badge */}
                <View style={[tw`self-start px-3 py-1 rounded-full mb-1`, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                  <Text style={[tw`font-extrabold text-[10px] tracking-wider uppercase`, { color: theme.colors.white }]}>{offer.discount}</Text>
                </View>

                {/* Offer Text Content */}
                <View style={tw`mb-2`}>
                  <Text style={[tw`text-2xl font-black tracking-tight leading-7`, { color: theme.colors.white }]}>{offer.title}</Text>
                  <Text style={[tw`text-sm font-semibold mt-1 opacity-90`, { color: theme.colors.white }]}>{offer.subTitle}</Text>
                </View>

                {/* Call To Action Button */}
                <TouchableOpacity style={[tw`px-5 py-2 rounded-xl self-start shadow-md`, { backgroundColor: theme.colors.white }]}>
                  <Text style={[tw`text-xs font-black uppercase tracking-wider`, { color: offer.gradientColors[0] }]}>Shop Now</Text>
                </TouchableOpacity>
              </View>

              {/* Graphic Right-side Emoji Float */}
              <View style={[tw`absolute justify-center items-center z-10`, { right: 16, bottom: 16 }]}>
                <Text style={tw`text-[100px] opacity-95`}>{offer.emoji}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Slide Indicators / Dots */}
      <View style={tw`flex-row justify-center items-center mt-3`}>
        {offers.map((_, index) => (
          <View
            key={index}
            style={[
              tw`h-2 rounded-full mx-1`,
              {
                width: activeIndex === index ? 16 : 8,
                backgroundColor: activeIndex === index ? theme.colors.primary : theme.colors.border,
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

