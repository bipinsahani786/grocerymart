import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

export const HighDemandBanner: React.FC = () => {
  const hotspots = [
    {
      id: 'hub_04',
      name: 'Koramangala Hub #04',
      surge: '+₹35',
      demand: 'High demand',
      distance: '0.4 km',
      isCurrent: true,
    },
    {
      id: 'hub_02',
      name: 'HSR Layout Sector 2',
      surge: '+₹25',
      demand: 'Surge active',
      distance: '2.1 km',
      isCurrent: false,
    },
    {
      id: 'hub_07',
      name: 'Indiranagar 100ft Rd',
      surge: '+₹30',
      demand: 'Surge active',
      distance: '3.8 km',
      isCurrent: false,
    },
  ];

  return (
    <View style={tw`mb-3.5`}>
      <View style={tw`flex-row justify-between items-center mb-2 px-0.5`}>
        <Text style={[tw`text-xs font-black uppercase tracking-wider`, { color: Colors.textSecondary }]}>
          High Surge Hotspots
        </Text>
        <Text style={[tw`text-[10px] font-bold`, { color: Colors.amberDark }]}>
          Live ⚡
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`gap-2.5 py-0.5`}
      >
        {hotspots.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            activeOpacity={0.85}
            style={[
              tw`w-56 p-3.5 rounded-2xl shadow-sm`,
              {
                backgroundColor: Colors.surface,
              },
            ]}
          >
            <View style={tw`flex-row justify-between items-start mb-1`}>
              <View style={tw`flex-1 mr-1.5`}>
                <Text style={[tw`text-xs font-black`, { color: Colors.text }]} numberOfLines={1}>
                  {spot.name}
                </Text>
                <Text style={[tw`text-[10px] mt-0.5`, { color: Colors.textSecondary }]}>
                  {spot.distance} • {spot.demand}
                </Text>
              </View>

              <View
                style={[
                  tw`px-1.5 py-0.5 rounded-md`,
                  { backgroundColor: Colors.amberLight },
                ]}
              >
                <Text style={[tw`text-[11px] font-black`, { color: Colors.amberDark }]}>
                  {spot.surge}
                </Text>
              </View>
            </View>

            {spot.isCurrent ? (
              <Text style={[tw`text-[10px] font-bold mt-1`, { color: Colors.primaryDark }]}>
                ✓ Current Hub Station
              </Text>
            ) : (
              <Text style={[tw`text-[10px] font-semibold mt-1`, { color: Colors.blue }]}>
                Navigate to zone →
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
