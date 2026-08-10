import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { offers } from '../data/groceryData';
import tw from 'twrnc';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export const OfferBanner: React.FC = () => {
  return (
    <View style={[tw`py-2`, { backgroundColor: theme.colors.cardBackground }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={tw`px-4`}
      >
        {offers.map((offer) => (
          <TouchableOpacity key={offer.id} activeOpacity={0.95}>
            <LinearGradient
              colors={offer.gradientColors as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                tw`h-38 rounded-3xl mr-4 flex-row p-4 justify-between items-center overflow-hidden`,
                { width: CARD_WIDTH }
              ]}
            >
              <View style={tw`flex-1 justify-center`}>
                <View style={[tw`self-start px-2 py-0.5 rounded-sm mb-1`, { backgroundColor: theme.colors.whiteTranslucent }]}>
                  <Text style={[tw`font-black text-[10px] tracking-wide`, { color: theme.colors.white }]}>{offer.discount}</Text>
                </View>
                <Text style={[tw`text-xl font-extrabold leading-6 mb-1`, { color: theme.colors.white }]}>{offer.title}</Text>
                <Text style={[tw`text-[12px] mb-3`, { color: theme.colors.whiteNearSolid }]}>{offer.subTitle}</Text>
                <TouchableOpacity style={[tw`px-3 py-1.5 rounded-md self-start shadow-sm`, { backgroundColor: theme.colors.white, shadowColor: theme.colors.shadowDark, elevation: 2 }]}>
                  <Text style={[tw`text-[12px] font-bold`, { color: theme.colors.primaryDark }]}>Shop Now</Text>
                </TouchableOpacity>
              </View>
              <View style={tw`items-center justify-center`}>
                <Text style={tw`text-[70px] opacity-90`}>{offer.emoji}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
