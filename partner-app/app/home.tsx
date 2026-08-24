import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../context/AuthContext';
import { useDeliveryContext } from '../context/DeliveryContext';
import { useDutyContext } from '../context/DutyContext';
import { DeliveryOrder } from '../constants/mockData';
import { Colors } from '../constants/theme';
import tw from 'twrnc';

// Common Components
import { PartnerHeader } from '../components/common/PartnerHeader';
import { CustomPartnerNavBar, PartnerTab } from '../components/common/CustomPartnerNavBar';

// Redesigned Home Cockpit
import { HomeCockpitView } from '../components/home/HomeCockpitView';

// Delivery Flow Components
import { IncomingOrderModal } from '../components/delivery/IncomingOrderModal';
import { NavigationMapView } from '../components/delivery/NavigationMapView';
import { StorePickupSection } from '../components/delivery/StorePickupSection';
import { CustomerDropSection } from '../components/delivery/CustomerDropSection';
import { DeliveryVerifyModal } from '../components/delivery/DeliveryVerifyModal';
import { OrderSuccessModal } from '../components/delivery/OrderSuccessModal';

// Earnings Tab Components
import { EarningsOverviewCard } from '../components/earnings/EarningsOverviewCard';
import { IncentiveProgress } from '../components/earnings/IncentiveProgress';
import { WalletPayoutModal } from '../components/earnings/WalletPayoutModal';

// Orders / Trips Tab Components
import { OrderFilterTabs, TripFilter } from '../components/orders/OrderFilterTabs';
import { OrderHistoryItem } from '../components/orders/OrderHistoryItem';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';

// Profile Tab Components
import { ProfileScreenView } from '../components/profile/ProfileScreenView';
import { SupportHelpModal } from '../components/profile/SupportHelpModal';
import { SettingsModal } from '../components/profile/SettingsModal';

export default function PartnerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuthContext();
  const {
    activeOrder,
    orderHistory,
  } = useDeliveryContext();

  const [activeTab, setActiveTab] = useState<PartnerTab>('home');
  const [tripFilter, setTripFilter] = useState<TripFilter>('ALL');

  // Modals state
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<DeliveryOrder | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastPayoutAmount, setLastPayoutAmount] = useState(130);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleDeliverySuccess = (payout: number) => {
    setLastPayoutAmount(payout);
    setShowSuccessModal(true);
  };

  const handleLogout = async () => {
    setShowSettingsModal(false);
    await logout();
    router.replace('/login');
  };

  // Filtered trips
  const filteredTrips = orderHistory.filter((order) => {
    if (tripFilter === 'TODAY') return order.createdAt.includes('AM') || order.createdAt.includes('PM') || order.createdAt === 'Just now';
    if (tripFilter === 'COMPLETED') return order.status === 'DELIVERED';
    if (tripFilter === 'COD') return order.paymentMode === 'CASH_ON_DELIVERY';
    return true;
  });

  return (
    <View style={[tw`flex-1`, { backgroundColor: Colors.background }]}>
      <StatusBar style="light" translucent backgroundColor="#10B981" />
      {/* Top App Header with Rider Profile snippet, Battery Telemetry and Duty Switch */}
      <PartnerHeader
        onOpenSOS={() => setShowSupportModal(true)}
        onOpenNotifications={() => {}}
        onOpenWallet={() => setActiveTab('earnings')}
      />

      {/* Main Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          tw`p-4`,
          {
            paddingBottom: 95 + Math.max(insets.bottom, 12),
          },
        ]}
      >
        {/* TAB 1: UNIFIED HOME RADAR COCKPIT */}
        {activeTab === 'home' && (
          <HomeCockpitView
            onViewWallet={() => setActiveTab('earnings')}
            onOpenActiveTask={() => setActiveTab('active')}
            onDepositCash={() => setShowWithdrawModal(true)}
            onOpenSupport={() => setShowSupportModal(true)}
          />
        )}

        {/* TAB 2: ACTIVE DELIVERY TASK JOURNEY */}
        {activeTab === 'active' && (
          <View>
            {activeOrder ? (
              <View>
                {/* Visual Navigation Map & Steps */}
                <NavigationMapView
                  headingText={
                    activeOrder.status === 'ACCEPTED' || activeOrder.status === 'AT_STORE'
                      ? 'Head to ' + activeOrder.storeName
                      : 'Deliver to ' + activeOrder.customerName
                  }
                  subText={
                    activeOrder.status === 'ACCEPTED' || activeOrder.status === 'AT_STORE'
                      ? activeOrder.storeAddress
                      : activeOrder.customerAddress
                  }
                  distanceRemaining={
                    activeOrder.status === 'ACCEPTED' || activeOrder.status === 'AT_STORE'
                      ? `${activeOrder.storeDistanceKm} km away`
                      : `${activeOrder.customerDistanceKm} km away`
                  }
                  etaMins={
                    activeOrder.status === 'ACCEPTED' || activeOrder.status === 'AT_STORE'
                      ? activeOrder.storeEstimatedMins
                      : activeOrder.customerEstimatedMins
                  }
                  isStoreRoute={activeOrder.status === 'ACCEPTED' || activeOrder.status === 'AT_STORE'}
                />

                {/* State Machine Step Rendering */}
                {activeOrder.status === 'ACCEPTED' || activeOrder.status === 'AT_STORE' ? (
                  <StorePickupSection order={activeOrder} />
                ) : (
                  <CustomerDropSection
                    order={activeOrder}
                    onOpenVerifyModal={() => setShowVerifyModal(true)}
                  />
                )}
              </View>
            ) : (
              <View
                style={[
                  tw`rounded-3xl p-6 border items-center mt-5 shadow-sm`,
                  { backgroundColor: Colors.surface, borderColor: Colors.border },
                ]}
              >
                <View
                  style={[
                    tw`w-16 h-16 rounded-full justify-center items-center mb-3`,
                    { backgroundColor: Colors.surfaceLight },
                  ]}
                >
                  <Ionicons name="bicycle" size={32} color={Colors.textMuted} />
                </View>
                <Text style={[tw`text-base font-extrabold`, { color: Colors.text }]}>
                  No Active Delivery Right Now
                </Text>
                <Text
                  style={[
                    tw`text-xs text-center mt-1.5 mb-5 leading-5`,
                    { color: Colors.textSecondary },
                  ]}
                >
                  {"You're all caught up! As soon as a customer orders groceries nearby, you'll receive a delivery request right here."}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setActiveTab('home')}
                  style={[
                    tw`py-3 px-6 rounded-xl flex-row items-center shadow-md`,
                    { backgroundColor: Colors.primary },
                  ]}
                >
                  <Ionicons name="arrow-back" size={16} color={Colors.white} style={tw`mr-1.5`} />
                  <Text style={[tw`text-xs font-black`, { color: Colors.white }]}>
                    Back to Dashboard Radar
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* TAB 3: TRIPS & HISTORY (Redesigned Cockpit) */}
        {activeTab === 'trips' && (
          <View style={tw`pb-4`}>
            {/* Quick Trip Performance Strip */}
            <View style={tw`flex-row justify-between items-center py-2.5 px-1 mb-3 border-b border-slate-200`}>
              <View style={tw`items-center flex-1`}>
                <Text style={tw`text-[9px] font-bold text-slate-400 uppercase tracking-wider`}>Today Trips</Text>
                <Text style={tw`text-base font-black text-slate-900 mt-0.5`}>14 Done</Text>
              </View>
              <View style={tw`w-[1px] bg-slate-200 h-6`} />
              <View style={tw`items-center flex-1`}>
                <Text style={tw`text-[9px] font-bold text-slate-400 uppercase tracking-wider`}>Earned</Text>
                <Text style={tw`text-base font-black text-emerald-600 mt-0.5`}>₹1,240</Text>
              </View>
              <View style={tw`w-[1px] bg-slate-200 h-6`} />
              <View style={tw`items-center flex-1`}>
                <Text style={tw`text-[9px] font-bold text-slate-400 uppercase tracking-wider`}>Distance</Text>
                <Text style={tw`text-base font-black text-slate-900 mt-0.5`}>48.2 km</Text>
              </View>
              <View style={tw`w-[1px] bg-slate-200 h-6`} />
              <View style={tw`items-center flex-1`}>
                <Text style={tw`text-[9px] font-bold text-slate-400 uppercase tracking-wider`}>Success</Text>
                <Text style={tw`text-base font-black text-emerald-600 mt-0.5`}>100%</Text>
              </View>
            </View>

            {/* Filter Tabs */}
            <OrderFilterTabs selectedFilter={tripFilter} onSelect={setTripFilter} />

            {/* Flat Route Timeline Trips List */}
            <View style={tw`mt-1`}>
              {filteredTrips.map((order) => (
                <OrderHistoryItem
                  key={order.id}
                  order={order}
                  onPress={() => setSelectedHistoryOrder(order)}
                />
              ))}
            </View>
          </View>
        )}

        {/* TAB 4: EARNINGS & WALLET (Unified Cockpit) */}
        {activeTab === 'earnings' && (
          <View>
            <EarningsOverviewCard onOpenWithdraw={() => setShowWithdrawModal(true)} />
          </View>
        )}

        {/* TAB 5: PROFILE & SETTINGS (Redesigned Native Inset Layout) */}
        {activeTab === 'profile' && (
          <ProfileScreenView
            onOpenSupport={() => setShowSupportModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenWallet={() => setActiveTab('earnings')}
            onLogout={handleLogout}
          />
        )}
      </ScrollView>

      {/* Bottom Partner Navigation Bar */}
      <CustomPartnerNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      <IncomingOrderModal />

      {activeOrder && (
        <DeliveryVerifyModal
          visible={showVerifyModal}
          order={activeOrder}
          onClose={() => setShowVerifyModal(false)}
          onSuccess={handleDeliverySuccess}
        />
      )}

      <OrderSuccessModal
        visible={showSuccessModal}
        payoutAmount={lastPayoutAmount}
        onDismiss={() => {
          setShowSuccessModal(false);
          setActiveTab('home');
        }}
      />

      <OrderDetailModal
        order={selectedHistoryOrder}
        onClose={() => setSelectedHistoryOrder(null)}
      />

      <WalletPayoutModal
        visible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      />

      <SupportHelpModal
        visible={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onLogout={handleLogout}
      />
    </View>
  );
}
