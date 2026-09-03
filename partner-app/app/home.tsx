import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
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

import { useRouter } from 'expo-router';

export default function PartnerHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const safeTop = Math.max(statusBarHeight, insets.top, 14);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshDeliveries();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };


  return (
    <View style={styles.container}>
      {/* Native Translucent Status Bar Matched with Emerald Header */}
      <StatusBar style="light" backgroundColor="#047857" translucent />

      {/* RENDER ACTIVE TAB WITH SAFE AREA COMPLIANCE */}
      {activeTab === 'home' ? (
        <HomeCockpitView
          onViewWallet={() => setActiveTab('earnings')}
          onOpenActiveTask={() => setActiveTab('active')}
          onDepositCash={() => setShowDepositModal(true)}
          onOpenSupport={() => setShowSOSModal(true)}
        />
      ) : activeTab === 'active' ? (
        <View style={styles.tabContainer}>
          <ActiveDeliveryView
            onContactSupport={() => setShowSOSModal(true)}
            onFindNewOrders={() => setActiveTab('home')}
          />
        </View>
      ) : (
        <View style={styles.tabContainer}>
          {/* Fixed Top Partner Header */}
          <PartnerHeader
            onOpenSOS={() => setShowSOSModal(true)}
            onOpenWallet={() => setActiveTab('earnings')}
          />

          {/* Scrollable Sub-Tab Content with Safe Refresh Control Offset */}
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
                progressViewOffset={safeTop + 50}
              />
            }
          >
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
        </View>
      )}

      {/* Bottom Partner Navigation Bar */}
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
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    backgroundColor: '#FFFFFF',
  },
});
