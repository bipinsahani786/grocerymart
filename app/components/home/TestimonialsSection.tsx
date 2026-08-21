import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      name: 'Rohan Sharma',
      location: 'Noida Sector 62',
      rating: 5,
      comment: 'Superfast delivery in 11 minutes! Vegetables were crisp, fresh and packed cleanly.',
      initials: 'RS',
      tag: 'Verified Buyer',
    },
    {
      name: 'Priya Verma',
      location: 'Indirapuram',
      rating: 5,
      comment: 'Sudha paneer and daily milk arrived chilled with zero hassle. Truly authentic products.',
      initials: 'PV',
      tag: 'VIP Member',
    },
    {
      name: 'Amit Patel',
      location: 'Greater Noida',
      rating: 5,
      comment: 'Great discounts compared to local shops and live order tracking works accurately.',
      initials: 'AP',
      tag: 'Verified Buyer',
    },
  ];

  return (
    <View style={tw`mb-6 px-4`}>
      <View style={tw`flex-row justify-between items-center mb-3`}>
        <View style={tw`flex-row items-center gap-1.5`}>
          <Text style={tw`text-sm`}>💬</Text>
          <Text style={tw`text-sm font-black text-slate-800 tracking-tight`}>
            Loved by 10,000+ Shoppers
          </Text>
        </View>
        <View style={tw`flex-row items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200`}>
          <Ionicons name="star" size={10} color="#D97706" />
          <Text style={tw`text-[10px] font-black text-amber-800`}>4.9/5 Rating</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`py-1`}
      >
        {reviews.map((r, idx) => (
          <View
            key={idx}
            style={[
              tw`mr-3 p-3.5 rounded-3xl border border-slate-200 bg-white shadow-sm justify-between`,
              { width: 220, minHeight: 120 },
            ]}
          >
            {/* Top row */}
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <View style={tw`flex-row items-center gap-2`}>
                <View style={tw`w-8 h-8 rounded-full bg-emerald-100 items-center justify-center border border-emerald-200`}>
                  <Text style={tw`text-[10px] font-black text-emerald-800`}>{r.initials}</Text>
                </View>
                <View>
                  <Text style={tw`text-[11px] font-black text-slate-800`}>{r.name}</Text>
                  <Text style={tw`text-[8.5px] font-semibold text-slate-400`}>{r.location}</Text>
                </View>
              </View>
              <View style={tw`flex-row`}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star" size={9} color="#F59E0B" />
                ))}
              </View>
            </View>

            {/* Comment */}
            <Text style={tw`text-[10px] font-medium text-slate-600 leading-4 mb-2`}>
              {`"${r.comment}"`}
            </Text>

            {/* Badge */}
            <View style={tw`self-start px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 flex-row items-center gap-1`}>
              <Ionicons name="checkmark-circle" size={10} color="#059669" />
              <Text style={tw`text-[8px] font-black text-emerald-700 uppercase`}>{r.tag}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
