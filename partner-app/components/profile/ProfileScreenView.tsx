import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { useDutyContext } from '../../context/DutyContext';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

interface ProfileScreenViewProps {
  onOpenSupport: () => void;
  onOpenSettings: () => void;
  onOpenWallet: () => void;
  onLogout: () => void;
}

export const ProfileScreenView: React.FC<ProfileScreenViewProps> = ({
  onOpenSupport,
  onOpenSettings,
  onOpenWallet,
  onLogout,
}) => {
  const { user } = useAuthContext();
  const { currentHub } = useDutyContext();
  const { earningsSummary } = useDeliveryContext();

  if (!user) return null;

  return (
    <View style={tw`pb-10`}>
      {/* 1. HERO RIDER PROFILE SECTION (Flat Native Header) */}
      <View style={[tw`items-center pt-2 pb-5 border-b`, { borderBottomColor: Colors.border }]}>
        <View style={tw`relative mb-3`}>
          <Image
            source={{
              uri:
                user.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            }}
            style={[tw`w-20 h-20 rounded-full border-2`, { borderColor: Colors.primary }]}
          />
          <View
            style={[
              tw`absolute bottom-0 right-0 px-2 py-0.5 rounded-full border shadow-sm`,
              { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
            ]}
          >
            <Text style={[tw`text-[10px] font-black`, { color: Colors.primaryDark }]}>
              {user.rating || '4.9'} ★
            </Text>
          </View>
        </View>

        <Text style={[tw`text-xl font-black`, { color: Colors.text }]}>
          {user.name || 'Sahil'}
        </Text>

        <Text style={[tw`text-xs mt-0.5 font-medium`, { color: Colors.textSecondary }]}>
          ID: {user.id || 'RID-88421'} • +91 {user.phone || '9876543210'}
        </Text>

        <View
          style={[
            tw`flex-row items-center px-3 py-1 rounded-full mt-2 border`,
            { backgroundColor: Colors.amberLight, borderColor: Colors.amber },
          ]}
        >
          <Ionicons name="shield-checkmark" size={13} color={Colors.amberDark} style={tw`mr-1`} />
          <Text style={[tw`text-xs font-black`, { color: Colors.amberDark }]}>
            {user.tier || 'Gold'} Delivery Partner
          </Text>
        </View>
      </View>

      {/* 2. FLAT LIFETIME STATS STRIP (No Cards, Flat Dividers) */}
      <View
        style={[
          tw`flex-row justify-between py-4 border-b`,
          { borderBottomColor: Colors.border },
        ]}
      >
        <View style={tw`items-center flex-1`}>
          <Text style={[tw`text-base font-black`, { color: Colors.text }]}>
            {user.totalTrips || '1,284'}
          </Text>
          <Text style={[tw`text-[10px] font-bold mt-0.5`, { color: Colors.textSecondary }]}>
            Total Trips
          </Text>
        </View>

        <View style={[tw`w-[1px]`, { backgroundColor: Colors.border }]} />

        <View style={tw`items-center flex-1`}>
          <Text style={[tw`text-base font-black`, { color: Colors.primaryDark }]}>
            {user.acceptanceRate || '99.2'}%
          </Text>
          <Text style={[tw`text-[10px] font-bold mt-0.5`, { color: Colors.textSecondary }]}>
            Acceptance
          </Text>
        </View>

        <View style={[tw`w-[1px]`, { backgroundColor: Colors.border }]} />

        <View style={tw`items-center flex-1`}>
          <Text style={[tw`text-base font-black`, { color: Colors.blueDark }]}>
            {user.onTimeRate || '98.5'}%
          </Text>
          <Text style={[tw`text-[10px] font-bold mt-0.5`, { color: Colors.textSecondary }]}>
            On-Time
          </Text>
        </View>
      </View>

      {/* 3. GROUPED LIST 1: VEHICLE & HUB DETAILS */}
      <View style={tw`mt-5`}>
        <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1 px-1`, { color: Colors.textSecondary }]}>
          Vehicle & Dark Store Hub
        </Text>

        <View style={[tw`border-t border-b`, { borderColor: Colors.border }]}>
          {/* Vehicle */}
          <View style={[tw`flex-row items-center justify-between py-3.5 px-1 border-b`, { borderBottomColor: Colors.borderLight }]}>
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <Ionicons name="bicycle" size={18} color={Colors.primary} style={tw`mr-3`} />
              <View style={tw`flex-1`}>
                <Text style={[tw`text-xs font-bold`, { color: Colors.text }]}>
                  {user.vehicleType ? 'Commercial Delivery Motorcycle' : 'Delivery Motorcycle'}
                </Text>
                <Text style={[tw`text-[11px]`, { color: Colors.textSecondary }]}>
                  RC: {user.vehicleNumber || 'KA-01-EQ-4921'}
                </Text>
              </View>
            </View>
            <View style={[tw`px-2 py-0.5 rounded`, { backgroundColor: Colors.primaryBg }]}>
              <Text style={[tw`text-[10px] font-bold`, { color: Colors.primaryDark }]}>Active ✓</Text>
            </View>
          </View>

          {/* Allocated Hub */}
          <View style={[tw`flex-row items-center justify-between py-3.5 px-1 border-b`, { borderBottomColor: Colors.borderLight }]}>
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <Ionicons name="storefront" size={18} color={Colors.blue} style={tw`mr-3`} />
              <View style={tw`flex-1`}>
                <Text style={[tw`text-xs font-bold`, { color: Colors.text }]}>
                  Operating Dark Store
                </Text>
                <Text style={[tw`text-[11px]`, { color: Colors.textSecondary }]}>
                  {currentHub || 'Koramangala Express Hub #04'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </View>

          {/* Blood Group */}
          <View style={[tw`flex-row items-center justify-between py-3.5 px-1`]}>
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <Ionicons name="water" size={18} color={Colors.danger} style={tw`mr-3`} />
              <View style={tw`flex-1`}>
                <Text style={[tw`text-xs font-bold`, { color: Colors.text }]}>
                  Emergency Blood Group
                </Text>
                <Text style={[tw`text-[11px]`, { color: Colors.textSecondary }]}>
                  Medical Insurance Dispatch Record
                </Text>
              </View>
            </View>
            <View style={[tw`px-2.5 py-0.5 rounded border`, { backgroundColor: Colors.dangerLight, borderColor: Colors.danger }]}>
              <Text style={[tw`text-xs font-black`, { color: Colors.danger }]}>O+ Positive</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 4. GROUPED LIST 2: BANK & FINANCIAL SETTLEMENT */}
      <View style={tw`mt-6`}>
        <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1 px-1`, { color: Colors.textSecondary }]}>
          Bank & Daily Settlement Mandate
        </Text>

        <View style={[tw`border-t border-b`, { borderColor: Colors.border }]}>
          {/* Bank Account */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenWallet}
            style={[tw`flex-row items-center justify-between py-3.5 px-1 border-b`, { borderBottomColor: Colors.borderLight }]}
          >
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <Ionicons name="card" size={18} color={Colors.primary} style={tw`mr-3`} />
              <View style={tw`flex-1`}>
                <Text style={[tw`text-xs font-bold`, { color: Colors.text }]}>
                  Direct Payout Bank Account
                </Text>
                <Text style={[tw`text-[11px]`, { color: Colors.textSecondary }]}>
                  HDFC Bank (A/C: ****8841 • IFSC: HDFC0001248)
                </Text>
              </View>
            </View>
            <View style={[tw`px-2 py-0.5 rounded`, { backgroundColor: Colors.blueLight }]}>
              <Text style={[tw`text-[10px] font-bold`, { color: Colors.blue }]}>IMPS 24x7</Text>
            </View>
          </TouchableOpacity>

          {/* PAN Card */}
          <View style={[tw`flex-row items-center justify-between py-3.5 px-1`]}>
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <Ionicons name="document-text" size={18} color={Colors.textSecondary} style={tw`mr-3`} />
              <View style={tw`flex-1`}>
                <Text style={[tw`text-xs font-bold`, { color: Colors.text }]}>
                  PAN Card Number
                </Text>
                <Text style={[tw`text-[11px]`, { color: Colors.textSecondary }]}>
                  ABCPS4821F (Verified with NSDL)
                </Text>
              </View>
            </View>
            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
          </View>
        </View>
      </View>

      {/* 5. GROUPED LIST 3: SAFETY, HELPLINE & SETTINGS */}
      <View style={tw`mt-6`}>
        <Text style={[tw`text-[11px] font-bold uppercase tracking-wider mb-1 px-1`, { color: Colors.textSecondary }]}>
          Safety, Support & Preferences
        </Text>

        <View style={[tw`border-t border-b`, { borderColor: Colors.border }]}>
          {/* Insurance */}
          <View style={[tw`flex-row items-center justify-between py-3.5 px-1 border-b`, { borderBottomColor: Colors.borderLight }]}>
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.primaryDark} style={tw`mr-3`} />
              <View style={tw`flex-1`}>
                <Text style={[tw`text-xs font-bold`, { color: Colors.text }]}>
                  ₹5 Lakh Fleet Accidental Insurance
                </Text>
                <Text style={[tw`text-[11px]`, { color: Colors.textSecondary }]}>
                  Policy Active • ICICI Lombard Fleet Cover
                </Text>
              </View>
            </View>
            <View style={[tw`px-2 py-0.5 rounded`, { backgroundColor: Colors.primaryBg }]}>
              <Text style={[tw`text-[10px] font-bold`, { color: Colors.primaryDark }]}>Covered ✓</Text>
            </View>
          </View>

          {/* Support */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenSupport}
            style={[tw`flex-row items-center justify-between py-3.5 px-1 border-b`, { borderBottomColor: Colors.borderLight }]}
          >
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <Ionicons name="headset" size={18} color={Colors.blue} style={tw`mr-3`} />
              <View style={tw`flex-1`}>
                <Text style={[tw`text-xs font-bold`, { color: Colors.text }]}>
                  24x7 Partner Captain Support & Helpline
                </Text>
                <Text style={[tw`text-[11px]`, { color: Colors.textSecondary }]}>
                  Live order assistance and Dark store manager connect
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenSettings}
            style={[tw`flex-row items-center justify-between py-3.5 px-1 border-b`, { borderBottomColor: Colors.borderLight }]}
          >
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <Ionicons name="settings" size={18} color={Colors.textSecondary} style={tw`mr-3`} />
              <View style={tw`flex-1`}>
                <Text style={[tw`text-xs font-bold`, { color: Colors.text }]}>
                  App Settings & Navigation
                </Text>
                <Text style={[tw`text-[11px]`, { color: Colors.textSecondary }]}>
                  Sound alerts, map navigation preference
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Logout Row */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onLogout}
            style={tw`flex-row items-center justify-between py-3.5 px-1`}
          >
            <View style={tw`flex-row items-center`}>
              <Ionicons name="log-out" size={18} color={Colors.danger} style={tw`mr-3`} />
              <Text style={[tw`text-xs font-black`, { color: Colors.danger }]}>
                Log Out of Partner Account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
