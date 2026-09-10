import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../constants/typography';
import tw from 'twrnc';

interface FleetComplianceSectionProps {
  vehicleModel: string;
  vehicleRc: string;
  isVehicleActive: boolean;
  dlText: string;
  panText: string;
  aadhaarText: string;
  isKycApproved: boolean;
  kycStatus: string;
  hasSubscription: boolean;
  subscriptionPlan: string | null;
  subscriptionExpiry: string | null;
  t: Record<string, string>;
  onOpenEditProfile: () => void;
  onOpenSubscription: () => void;
}

export const FleetComplianceSection: React.FC<FleetComplianceSectionProps> = ({
  vehicleModel,
  vehicleRc,
  isVehicleActive,
  dlText,
  panText,
  aadhaarText,
  isKycApproved,
  kycStatus,
  hasSubscription,
  subscriptionPlan,
  subscriptionExpiry,
  t,
  onOpenEditProfile,
  onOpenSubscription,
}) => {
  return (
    <View style={tw`py-4 border-b border-slate-100`}>
      <Text
        style={[
          Typography.caption,
          { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 },
        ]}
      >
        {t.fleetVerification || 'FLEET & COMPLIANCE'}
      </Text>

      {/* Vehicle (Real DB Data) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenEditProfile}
        style={tw`flex-row justify-between items-center py-2.5`}
      >
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <Ionicons name="bicycle" size={17} color="#2563EB" style={tw`mr-3`} />
          <View style={tw`flex-1`}>
            <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
              {t.registeredVehicle || 'Registered Vehicle'}
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
              {vehicleModel} • {vehicleRc}
            </Text>
          </View>
        </View>
        <View style={tw`flex-row items-center`}>
          <Text
            style={[
              Typography.badge,
              { color: isVehicleActive ? '#047857' : '#D97706', fontSize: 9.5, marginRight: 2 },
            ]}
          >
            {isVehicleActive ? t.active || 'Active' : 'Pending'}
          </Text>
          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" style={tw`ml-1`} />
        </View>
      </TouchableOpacity>

      {/* KYC Documents (Real DB Data) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenEditProfile}
        style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}
      >
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <Ionicons name="document-text" size={17} color="#059669" style={tw`mr-3`} />
          <View style={tw`flex-1`}>
            <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
              {t.kycDocuments || 'KYC Documents'}
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
              {dlText} • {panText} • {aadhaarText}
            </Text>
          </View>
        </View>
        <View style={tw`flex-row items-center`}>
          <Text
            style={[
              Typography.badge,
              {
                color: isKycApproved ? '#047857' : kycStatus === 'REJECTED' ? '#DC2626' : '#D97706',
                fontSize: 9.5,
                marginRight: 2,
              },
            ]}
          >
            {isKycApproved ? t.verified || 'Verified' : kycStatus === 'REJECTED' ? 'Rejected' : 'Pending Verification'}
          </Text>
          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" style={tw`ml-1`} />
        </View>
      </TouchableOpacity>

      {/* Partner Subscription Pass (Real DB Data: NONE by default, can be bought later) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenSubscription}
        style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}
      >
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <Ionicons
            name={hasSubscription ? 'sparkles' : 'sparkles-outline'}
            size={17}
            color={hasSubscription ? '#059669' : '#64748B'}
            style={tw`mr-3`}
          />
          <View style={tw`flex-1`}>
            <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
              {hasSubscription ? (subscriptionPlan || 'Captain Pass') : 'Partner Subscription'}
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
              {hasSubscription
                ? `Active • Valid until ${subscriptionExpiry ? new Date(subscriptionExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Active'}`
                : 'No active subscription • Tap to explore passes'}
            </Text>
          </View>
        </View>
        <View style={tw`flex-row items-center`}>
          <Text
            style={[
              Typography.badge,
              {
                color: hasSubscription ? '#059669' : '#64748B',
                fontSize: 9.5,
                marginRight: 2,
              },
            ]}
          >
            {hasSubscription ? 'ACTIVE' : 'No Subscription'}
          </Text>
          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" style={tw`ml-1`} />
        </View>
      </TouchableOpacity>
    </View>
  );
};
