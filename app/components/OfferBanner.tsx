import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { offers } from '../data/groceryData';
import tw from 'twrnc';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width;

export const OfferBanner: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / CARD_WIDTH);
    if (index >= 0 && index < offers.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={tw`relative w-full`}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
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
                tw`h-[460px] rounded-none p-6 justify-between overflow-hidden relative shadow-xl z-20`,
                { 
                  width: CARD_WIDTH, 
                  paddingTop: 185,
                }
              ]}
            >
              {/* Modern Graphic Abstract Circles in Background */}
              <View style={[tw`absolute rounded-full`, { right: -30, top: -20, width: 220, height: 220, backgroundColor: 'rgba(255, 255, 255, 0.12)' }]} />
              <View style={[tw`absolute rounded-full`, { right: 90, bottom: -40, width: 130, height: 130, backgroundColor: 'rgba(255, 255, 255, 0.08)' }]} />

              <View style={tw`flex-1 justify-between z-10`}>
                {/* Top Badge (Shifted slightly down) */}
                <View style={[tw`self-start px-3 py-1 rounded-full mt-6 mb-1`, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                  <Text style={[tw`font-extrabold text-[10px] tracking-wider uppercase`, { color: theme.colors.white }]}>{offer.discount}</Text>
                </View>

                {/* Offer Text Content */}
                <View style={tw`mb-2`}>
                  <Text style={[tw`text-2xl font-black tracking-tight leading-7`, { color: theme.colors.white }]}>{offer.title}</Text>
                  <Text style={[tw`text-sm font-semibold mt-1 opacity-90`, { color: theme.colors.white }]}>{offer.subTitle}</Text>
                </View>

                {/* Call To Action Button */}
                <TouchableOpacity style={[tw`px-5 py-2 rounded-xl self-start shadow-md mb-6`, { backgroundColor: theme.colors.white }]}>
                  <Text style={[tw`text-xs font-black uppercase tracking-wider`, { color: offer.gradientColors[0] }]}>Shop Now</Text>
                </TouchableOpacity>
              </View>

              {/* Graphic Right-side Emoji Float */}
              <View style={[tw`absolute justify-center items-center z-10`, { right: 16, bottom: 36 }]}>
                <Text style={tw`text-[110px] opacity-95`}>{offer.emoji}</Text>
              </View>

              {/* Fading Overlay mixing with below UI */}
              <LinearGradient
                colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.4)', theme.colors.cardBackground]}
                style={[tw`absolute bottom-0 left-0 right-0 h-16 z-20`]}
              />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Slide Indicators / Dots at the bottom of the Hero Banner */}
      <View style={[tw`absolute flex-row justify-center items-center w-full z-30`, { bottom: 12 }]}>
        {offers.map((_, index) => (
          <View
            key={index}
            style={[
              tw`h-1.5 rounded-full mx-1 shadow-sm`,
              {
                width: activeIndex === index ? 16 : 6,
                backgroundColor: activeIndex === index ? theme.colors.primary : 'rgba(156, 163, 175, 0.5)',
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

