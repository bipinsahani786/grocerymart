import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '../context/AuthContext';
import { useDeliveryContext } from '../context/DeliveryContext';
import { useDutyContext } from '../context/DutyContext';

// Common Components
import { PartnerHeader } from '../components/common/PartnerHeader';
import { CustomPartnerNavBar, PartnerTabType } from '../components/common/CustomPartnerNavBar';

// Views
import { HomeCockpitView } from '../components/home/HomeCockpitView';
import { ActiveDeliveryView } from '../components/delivery/ActiveDeliveryView';
import { TripsHistoryView } from '../components/trips/TripsHistoryView';
import { EarningsView } from '../components/earnings/EarningsView';
import { PartnerProfileView } from '../components/profile/PartnerProfileView';

// Modals
import { IncomingOrderModal } from '../components/delivery/IncomingOrderModal';
import { CashDepositModal } from '../components/common/CashDepositModal';
import { SOSSupportModal } from '../components/common/SOSSupportModal';

export default function PartnerHomeScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuthContext();
  const {
    activeOrder,
    incomingOrder,
    acceptIncomingOrder,
    rejectIncomingOrder,
    refreshDeliveries,
  } = useDeliveryContext();
  const { isOnline } = useDutyContext();

  const [activeTab, setActiveTab] = useState<PartnerTabType>('home');
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDeliveries();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      {/* Native Status Bar Matched with Emerald Navbar */}
      <StatusBar style="light" backgroundColor="#047857" translucent />

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'home' ? (
        <HomeCockpitView
          onViewWallet={() => setActiveTab('earnings')}
          onOpenActiveTask={() => setActiveTab('active')}
          onDepositCash={() => setShowDepositModal(true)}
          onOpenSupport={() => setShowSOSModal(true)}
        />
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 85 + Math.max(insets.bottom, 16) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#10B981']}
              tintColor="#10B981"
            />
          }
        >
          {/* Top Header for Sub-Tabs */}
          <PartnerHeader
            onOpenSOS={() => setShowSOSModal(true)}
            onOpenWallet={() => setActiveTab('earnings')}
          />

          {activeTab === 'active' && (
            <ActiveDeliveryView
              onContactSupport={() => setShowSOSModal(true)}
              onFindNewOrders={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'trips' && <TripsHistoryView />}

          {activeTab === 'earnings' && (
            <EarningsView onDepositCash={() => setShowDepositModal(true)} />
          )}

          {activeTab === 'profile' && (
            <PartnerProfileView
              onOpenDeposit={() => setShowDepositModal(true)}
              onOpenSOS={() => setShowSOSModal(true)}
              onLogout={handleLogout}
            />
          )}
        </ScrollView>
      )}

      {/* Bottom Partner Navigation Bar (Untouched) */}
      <CustomPartnerNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      <IncomingOrderModal
        visible={!!incomingOrder}
        order={incomingOrder}
        onAccept={acceptIncomingOrder}
        onReject={rejectIncomingOrder}
      />

      <CashDepositModal
        visible={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />

      <SOSSupportModal
        visible={showSOSModal}
        onClose={() => setShowSOSModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#047857',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
});
