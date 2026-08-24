import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

export const ProfileHeader: React.FC = () => {
  const { user } = useAuthContext();

  if (!user) return null;

  return (
    <View
      style={[
        tw`rounded-3xl p-5 border mb-4 shadow-sm`,
        { backgroundColor: Colors.surface, borderColor: Colors.border },
      ]}
    >
      {/* Top Profile snippet */}
      <View style={tw`flex-row items-center`}>
        <Image
          source={{ uri: user.avatar }}
          style={[tw`w-16 h-16 rounded-full border-2 mr-3.5`, { borderColor: Colors.primary }]}
        />

        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center`}>
            <Text style={[tw`text-lg font-black mr-2`, { color: Colors.text }]}>
              {user.name}
            </Text>
          </View>
          <Text style={[tw`text-xs mt-0.5`, { color: Colors.textSecondary }]}>
            ID: {user.id} • {user.phone}
          </Text>

          {/* Tier Badge */}
          <View
            style={[
              tw`flex-row items-center border px-2 py-0.5 rounded-md self-start mt-1.5`,
              { backgroundColor: Colors.amberLight, borderColor: Colors.amber },
            ]}
          >
            <Ionicons name="sparkles" size={12} color={Colors.amber} style={tw`mr-1`} />
            <Text style={[tw`text-[11px] font-bold`, { color: Colors.amberDark }]}>
              {user.tier} Rider
            </Text>
          </View>
        </View>
      </View>

      {/* Performance Statistics Row */}
      <View
        style={[
          tw`flex-row rounded-2xl p-3 mt-4 justify-between border`,
          { backgroundColor: Colors.surfaceLight, borderColor: Colors.borderLight },
        ]}
      >
        <View style={tw`items-center flex-1`}>
          <Text style={[tw`text-base font-black`, { color: Colors.amberDark }]}>
            {user.rating} ★
          </Text>
          <Text style={[tw`text-[10px] mt-0.5`, { color: Colors.textSecondary }]}>
            Rating (1.4k)
          </Text>
        </View>

        <View style={[tw`w-[1px]`, { backgroundColor: Colors.border }]} />

        <View style={tw`items-center flex-1`}>
          <Text style={[tw`text-base font-black`, { color: Colors.primaryDark }]}>
            {user.acceptanceRate}%
          </Text>
          <Text style={[tw`text-[10px] mt-0.5`, { color: Colors.textSecondary }]}>
            Acceptance
          </Text>
        </View>

        <View style={[tw`w-[1px]`, { backgroundColor: Colors.border }]} />

        <View style={tw`items-center flex-1`}>
          <Text style={[tw`text-base font-black`, { color: Colors.blueDark }]}>
            {user.onTimeRate}%
          </Text>
          <Text style={[tw`text-[10px] mt-0.5`, { color: Colors.textSecondary }]}>
            On-Time
          </Text>
        </View>

        <View style={[tw`w-[1px]`, { backgroundColor: Colors.border }]} />

        <View style={tw`items-center flex-1`}>
          <Text style={[tw`text-base font-black`, { color: Colors.text }]}>
            {user.totalTrips}
          </Text>
          <Text style={[tw`text-[10px] mt-0.5`, { color: Colors.textSecondary }]}>
            Total Trips
          </Text>
        </View>
      </View>
    </View>
  );
};
