import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface RiderSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PlanOption {
  key: string;
  name: string;
  duration: string;
  price: number;
  perks: string[];
  popular?: boolean;
  color: string;
}

const SUBSCRIPTION_PLANS: PlanOption[] = [
  {
    key: 'WEEKLY_BOOST',
    name: 'Weekly Captain Boost',
    duration: '7 Days Validity',
    price: 49,
    color: '#3B82F6',
    perks: [
      '0% Platform fee on tips & bonuses',
      'Priority dark store order queue',
      'Instant payout unlock',
    ],
  },
  {
    key: 'MONTHLY_PRO',
    name: 'Monthly Captain Pro',
    duration: '30 Days Validity',
    price: 149,
    popular: true,
    color: '#059669',
    perks: [
      'Zero platform commission on all orders',
      '₹5,00,000 Accidental & Health Insurance cover',
      'Top surge order allocation in peak hours',
      'Free rain gear & delivery kit upgrade',
    ],
  },
  {
    key: 'ANNUAL_ELITE',
    name: 'Annual Elite Pass',
    duration: '365 Days Validity',
    price: 999,
    color: '#7C3AED',
    perks: [
      'VIP Dark Store Express Bay',
      '2x Extra surge earnings boost',
      'Family health cover extension',
      'Priority captain support line 24/7',
    ],
  },
];

export const RiderSubscriptionModal: React.FC<RiderSubscriptionModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { user, deliveryPartner, buySubscription, cancelSubscription } = useAuthContext();

  const [selectedPlan, setSelectedPlan] = useState<string>('MONTHLY_PRO');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const currentStatus = deliveryPartner?.subscriptionStatus || user?.subscriptionStatus || 'NONE';
  const isCurrentlySubscribed = currentStatus === 'ACTIVE';
  const activePlanName = deliveryPartner?.subscriptionPlan || user?.subscriptionPlan || 'Captain Pass';
  const activeExpiry = deliveryPartner?.subscriptionExpiry || user?.subscriptionExpiry;

  const handleBuy = async () => {
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await buySubscription(selectedPlan);
      if (res.success) {
        setMessage('Subscription plan activated successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(res.message || 'Failed to activate subscription. Please try again.');
      }
    } catch {
      setError('Network error while purchasing subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await cancelSubscription();
      if (res.success) {
        setMessage('Subscription cancelled.');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(res.message || 'Failed to cancel.');
      }
    } catch {
      setError('Network error while cancelling subscription.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const safeTop = Math.max(statusBarHeight, insets.top, 14);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={tw`flex-1 bg-slate-50`}>
        {/* Sticky Header */}
        <View
          style={[
            tw`px-4 pb-3 bg-white border-b border-slate-100 flex-row items-center justify-between shadow-sm`,
            { paddingTop: Platform.OS === 'ios' ? Math.max(safeTop - 10, 8) : 8 },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={tw`p-1.5 -ml-1`}>
            <Ionicons name="close" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={tw`items-center flex-1 mx-2`}>
            <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 16, fontWeight: '900' }]}>
              Captain Subscription Passes
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
              Optional premium plans for boosted earnings & insurance
            </Text>
          </View>

          <View style={tw`w-8`} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[tw`px-4 pt-4`, { paddingBottom: insets.bottom + 90 }]}
        >
          {/* Status Banner */}
          {isCurrentlySubscribed ? (
            <View style={tw`p-4 rounded-2xl bg-emerald-900 border border-emerald-800 mb-4 shadow-md`}>
              <View style={tw`flex-row justify-between items-center mb-1`}>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="shield-checkmark" size={18} color="#34D399" style={tw`mr-2`} />
                  <Text style={tw`text-sm font-black text-white`}>{activePlanName}</Text>
                </View>
                <View style={tw`px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40`}>
                  <Text style={tw`text-[10px] font-black text-emerald-300`}>ACTIVE</Text>
                </View>
              </View>
              <Text style={tw`text-xs text-emerald-200 mt-1`}>
                Valid until:{' '}
                {activeExpiry ? new Date(activeExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Active'}
              </Text>
              <TouchableOpacity
                onPress={handleCancel}
                disabled={submitting}
                style={tw`mt-3 py-1.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-700/50 self-start`}
              >
                <Text style={tw`text-[10.5px] font-bold text-rose-300`}>Cancel Subscription</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={tw`p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex-row items-center mb-4`}>
              <View style={tw`w-8 h-8 rounded-xl bg-amber-100 items-center justify-center mr-3 border border-amber-300`}>
                <Ionicons name="sparkles-outline" size={17} color="#D97706" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs font-black text-amber-900`}>No Active Subscription</Text>
                <Text style={tw`text-[10.5px] text-amber-700 leading-4 mt-0.5`}>
                  Subscriptions are completely optional and never charged by default. Choose a pass below to unlock perks anytime.
                </Text>
              </View>
            </View>
          )}

          {/* Messages */}
          {error ? (
            <View style={tw`p-3 rounded-xl bg-rose-50 border border-rose-200 flex-row items-center mb-3`}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={tw`mr-2`} />
              <Text style={tw`text-xs font-bold text-rose-700 flex-1`}>{error}</Text>
            </View>
          ) : null}

          {message ? (
            <View style={tw`p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex-row items-center mb-3`}>
              <Ionicons name="checkmark-circle" size={16} color="#047857" style={tw`mr-2`} />
              <Text style={tw`text-xs font-bold text-emerald-800 flex-1`}>{message}</Text>
            </View>
          ) : null}

          {/* Plan Cards */}
          <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 px-1`}>
            Available Subscription Passes
          </Text>

          {SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.key;
            return (
              <TouchableOpacity
                key={plan.key}
                activeOpacity={0.85}
                onPress={() => setSelectedPlan(plan.key)}
                style={[
                  tw`p-4 rounded-2xl mb-3 border bg-white shadow-sm`,
                  isSelected
                    ? tw`border-emerald-600 bg-emerald-50/20`
                    : tw`border-slate-200 bg-white`,
                ]}
              >
                {plan.popular && (
                  <View style={tw`absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-600`}>
                    <Text style={tw`text-[9px] font-black text-white uppercase tracking-wider`}>
                      POPULAR
                    </Text>
                  </View>
                )}

                <View style={tw`flex-row items-center mb-2`}>
                  <View
                    style={[
                      tw`w-5 h-5 rounded-full border items-center justify-center mr-2.5`,
                      isSelected
                        ? tw`border-emerald-600 bg-emerald-600`
                        : tw`border-slate-300 bg-white`,
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 13.5 }]}>
                      {plan.name}
                    </Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                      {plan.duration}
                    </Text>
                  </View>
                  <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 17, fontWeight: '900' }]}>
                    ₹{plan.price}
                  </Text>
                </View>

                {/* Perks List */}
                <View style={tw`mt-2 pt-2 border-t border-slate-100`}>
                  {plan.perks.map((perk, idx) => (
                    <View key={idx} style={tw`flex-row items-center my-0.8`}>
                      <Ionicons name="checkmark-circle-outline" size={13} color="#059669" style={tw`mr-2`} />
                      <Text style={tw`text-[11px] font-medium text-slate-700 flex-1`}>{perk}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Pinned Bottom Action Bar */}
        <View
          style={[
            tw`px-5 py-3 border-t border-slate-100 bg-white flex-row gap-3 shadow-lg`,
            { paddingBottom: Math.max(insets.bottom, 12) + 6 },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={tw`flex-1 py-3 rounded-2xl bg-slate-100 border border-slate-200 items-center justify-center`}
          >
            <Text style={tw`text-xs font-bold text-slate-600`}>CLOSE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBuy}
            disabled={submitting}
            style={tw`flex-2 py-3 rounded-2xl bg-emerald-600 flex-row items-center justify-center shadow-md`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="card-outline" size={16} color="#FFFFFF" style={tw`mr-1.5`} />
                <Text style={tw`text-xs font-black text-white tracking-wide`}>
                  {isCurrentlySubscribed ? 'CHANGE / RENEW PASS' : 'ACTIVATE PASS'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
