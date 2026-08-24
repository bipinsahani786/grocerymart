import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../context/AuthContext';
import { useDeliveryContext } from '../context/DeliveryContext';
import { DeliveryOrder } from '../constants/mockData';
import { Colors } from '../constants/theme';
import tw from 'twrnc';

// Common Components
import { PartnerHeader } from '../components/common/PartnerHeader';
import { CustomPartnerNavBar, PartnerTab } from '../components/common/CustomPartnerNavBar';

// Home Tab Components
import { ShiftSummaryCard } from '../components/home/ShiftSummaryCard';
import { HighDemandBanner } from '../components/home/HighDemandBanner';
import { ActiveTaskCard } from '../components/home/ActiveTaskCard';
import { QuickActionGrid } from '../components/home/QuickActionGrid';

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
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { DocumentStatusCard } from '../components/profile/DocumentStatusCard';
import { VehicleInfoCard } from '../components/profile/VehicleInfoCard';
import { SupportHelpModal } from '../components/profile/SupportHelpModal';
import { SettingsModal } from '../components/profile/SettingsModal';

export default function PartnerHomeScreen() {
  const router = useRouter();
  const { logout } = useAuthContext();
  const {
    activeOrder,
    orderHistory,
    triggerIncomingOrderSimulation,
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
      {/* Top App Header */}
      <PartnerHeader
        onOpenSOS={() => setShowSupportModal(true)}
        onOpenNotifications={() => {}}
        onOpenWallet={() => setActiveTab('earnings')}
      />

      {/* Main Tab Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`p-4 pb-6`}
      >
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'home' && (
          <View>
            <ShiftSummaryCard onViewWallet={() => setActiveTab('earnings')} />
            <ActiveTaskCard onOpenActiveTask={() => setActiveTab('active')} />
            <HighDemandBanner />
            <QuickActionGrid
              onDepositCash={() => setShowWithdrawModal(true)}
              onOpenSupport={() => setShowSupportModal(true)}
              onOpenHotspots={() => {}}
            />
          </View>
        )}

        {/* TAB 2: ACTIVE DELIVERY TASK */}
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
                  tw`rounded-2xl p-6 border items-center mt-5 shadow-sm`,
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
                  onPress={triggerIncomingOrderSimulation}
                  style={[
                    tw`py-3 px-5 rounded-xl flex-row items-center shadow-md`,
                    { backgroundColor: Colors.primary },
                  ]}
                >
                  <Ionicons name="notifications" size={16} color={Colors.white} style={tw`mr-1.5`} />
                  <Text style={[tw`text-xs font-black`, { color: Colors.white }]}>
                    Trigger Sample Delivery Request
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* TAB 3: TRIPS & HISTORY */}
        {activeTab === 'trips' && (
          <View>
            <View style={tw`flex-row justify-between items-center mb-2.5`}>
              <Text style={[tw`text-lg font-black`, { color: Colors.text }]}>Trip History</Text>
              <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
                {orderHistory.length} Total Deliveries
              </Text>
            </View>

            <OrderFilterTabs selectedFilter={tripFilter} onSelect={setTripFilter} />

            <View style={tw`mt-1.5`}>
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

        {/* TAB 4: EARNINGS & WALLET */}
        {activeTab === 'earnings' && (
          <View>
            <EarningsOverviewCard onOpenWithdraw={() => setShowWithdrawModal(true)} />
            <IncentiveProgress />
          </View>
        )}

        {/* TAB 5: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <View>
            <ProfileHeader />
            <VehicleInfoCard />
            <DocumentStatusCard />

            {/* Support & Settings action list */}
            <View style={tw`gap-2 mt-1 mb-5`}>
              <TouchableOpacity
                onPress={() => setShowSupportModal(true)}
                style={[
                  tw`flex-row items-center border rounded-xl p-3.5 shadow-sm`,
                  { backgroundColor: Colors.surface, borderColor: Colors.border },
                ]}
              >
                <Ionicons name="headset-outline" size={20} color={Colors.primary} style={tw`mr-3`} />
                <Text style={[tw`flex-1 text-xs font-bold`, { color: Colors.text }]}>
                  24x7 Partner Support & Emergency
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowSettingsModal(true)}
                style={[
                  tw`flex-row items-center border rounded-xl p-3.5 shadow-sm`,
                  { backgroundColor: Colors.surface, borderColor: Colors.border },
                ]}
              >
                <Ionicons name="settings-outline" size={20} color={Colors.blue} style={tw`mr-3`} />
                <Text style={[tw`flex-1 text-xs font-bold`, { color: Colors.text }]}>
                  Preferences & Settings
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
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
