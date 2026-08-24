import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { useDutyContext } from '../../context/DutyContext';
import { Colors } from '../../constants/theme';
import { DutySwitch } from './DutySwitch';
import tw from 'twrnc';

interface PartnerHeaderProps {
  onOpenSOS?: () => void;
  onOpenNotifications?: () => void;
  onOpenWallet?: () => void;
}

export const PartnerHeader: React.FC<PartnerHeaderProps> = ({
  onOpenSOS,
  onOpenNotifications,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { currentHub, batteryLevel } = useDutyContext();

  return (
    <View
      style={[
        tw`border-b px-4 pb-3.5 shadow-sm`,
        {
          backgroundColor: Colors.surface,
          borderBottomColor: Colors.border,
          paddingTop: Math.max(insets.top, 12) + 8,
        },
      ]}
    >
      {/* Top row: Profile snippet + Duty Switch */}
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center flex-1`}>
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' }}
            style={[tw`w-10.5 h-10.5 rounded-full border-2 mr-2.5`, { borderColor: Colors.primary }]}
          />
          <View style={tw`flex-1 pr-2`}>
            <View style={tw`flex-row items-center`}>
              <Text
                style={[tw`text-base font-bold mr-1.5`, { color: Colors.text }]}
                numberOfLines={1}
              >
                {user?.name || 'Delivery Partner'}
              </Text>
              <View style={[tw`px-1.5 py-0.5 rounded`, { backgroundColor: Colors.amberLight }]}>
                <Text style={[tw`text-[10px] font-bold`, { color: Colors.amberDark }]}>
                  {user?.rating} ★
                </Text>
              </View>
            </View>
            <View style={tw`flex-row items-center mt-0.5`}>
              <Ionicons name="location" size={11} color={Colors.primary} style={tw`mr-1`} />
              <Text
                style={[tw`text-[11px]`, { color: Colors.textSecondary }]}
                numberOfLines={1}
              >
                {currentHub}
              </Text>
            </View>
          </View>
        </View>

        <DutySwitch />
      </View>

      {/* Sub Info Row: Battery, SOS, and Notifications */}
      <View style={[tw`flex-row items-center justify-between mt-3 pt-2.5 border-t`, { borderTopColor: Colors.border }]}>
        <View style={tw`flex-row items-center`}>
          <Ionicons name="battery-charging" size={14} color={Colors.primary} style={tw`mr-1`} />
          <Text style={[tw`text-[11px] mr-3`, { color: Colors.textSecondary }]}>
            EV Battery: {batteryLevel}%
          </Text>
          <View style={[tw`px-1.5 py-0.5 rounded`, { backgroundColor: Colors.primaryBg }]}>
            <Text style={[tw`text-[10px] font-semibold`, { color: Colors.primaryDark }]}>
              GPS Locked
            </Text>
          </View>
        </View>

        <View style={tw`flex-row items-center gap-2`}>
          <TouchableOpacity
            onPress={onOpenSOS}
            style={[
              tw`flex-row items-center border px-2 py-1 rounded-lg`,
              { backgroundColor: Colors.dangerLight, borderColor: Colors.danger },
            ]}
          >
            <Ionicons name="warning" size={12} color={Colors.danger} style={tw`mr-1`} />
            <Text style={[tw`text-[11px] font-bold`, { color: Colors.danger }]}>
              SOS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onOpenNotifications}
            style={[tw`w-7 h-7 rounded-full justify-center items-center`, { backgroundColor: Colors.surfaceLight }]}
          >
            <Ionicons name="notifications-outline" size={14} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
