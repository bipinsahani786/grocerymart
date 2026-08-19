import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
  Clipboard,
  Alert,
  TextInput,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { useAuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface ProfileOrdersModalProps {
  visible: boolean;
  onClose: () => void;
}

type OrderFilterTab = 'all' | 'active' | 'delivered';

export const ProfileOrdersModal: React.FC<ProfileOrdersModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<OrderFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  useEffect(() => {
    if (visible) {
      RNStatusBar.setBarStyle('light-content', true);
      if (Platform.OS === 'android') {
        RNStatusBar.setBackgroundColor('transparent', true);
        RNStatusBar.setTranslucent(true);
      }
    }
  }, [visible]);

  const {
    data: orders = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['customer-orders', user?.id, user?.phone],
    queryFn: () => productService.fetchMyOrders(user?.id, user?.phone),
    enabled: visible,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const handleCopy = (orderNum: string) => {
    Clipboard.setString(orderNum);
    setCopiedId(orderNum);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReorder = (order: any) => {
    if (!order.items || order.items.length === 0) return;

    order.items.forEach((item: any) => {
      addToCart({
        id: item.productId || item.id || `reorder-${item.name}`,
        name: item.name,
        price: item.priceAtOrder || 0,
        weight: item.unit || '1 unit',
        emoji: '🛒',
      });
    });

    Alert.alert('Items Added', `${order.items.length} items added to your basket.`, [
      { text: 'View Basket', onPress: onClose },
      { text: 'Keep Browsing', style: 'cancel' },
    ]);
  };

  const isOrderActive = (status: string) => {
    return ['PLACED', 'ACCEPTED', 'PACKING', 'PACKED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(status);
  };

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) => {
      const matchesTab =
        activeTab === 'all'
          ? true
          : activeTab === 'active'
          ? isOrderActive(order.status)
          : !isOrderActive(order.status) && order.status !== 'CANCELLED';

      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchNum = order.orderNumber?.toLowerCase().includes(q);
      const matchStore = order.store?.name?.toLowerCase().includes(q);
      const matchItem = order.items?.some((i: any) => i.name?.toLowerCase().includes(q));

      return matchNum || matchStore || matchItem;
    });
  }, [orders, activeTab, searchQuery]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter((o: any) => isOrderActive(o.status)).length;
  }, [orders]);

  const deliveredOrdersCount = useMemo(() => {
    return orders.filter((o: any) => !isOrderActive(o.status) && o.status !== 'CANCELLED').length;
  }, [orders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLACED':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', label: 'Order Placed ⚡', icon: 'flash' };
      case 'ACCEPTED':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', label: 'Accepted 📝', icon: 'document-text' };
      case 'PACKING':
      case 'PACKED':
        return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', label: 'Packed 📦', icon: 'cube' };
      case 'OUT_FOR_DELIVERY':
        return { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', label: 'Out for Delivery 🛵', icon: 'bicycle' };
      case 'DELIVERED':
      case 'COMPLETED':
      case 'COLLECTED':
        return { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-900', label: 'Delivered ✅', icon: 'checkmark-circle' };
      case 'CANCELLED':
        return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', label: 'Cancelled ❌', icon: 'close-circle' };
      default:
        return { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-700', label: status, icon: 'receipt' };
    }
  };

  const getActiveStepIndex = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'PACKING':
      case 'PACKED':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (_) {
      return dateString;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      hardwareAccelerated={true}
      onShow={() => {
        RNStatusBar.setBarStyle('light-content', true);
        if (Platform.OS === 'android') {
          RNStatusBar.setBackgroundColor('transparent', true);
          RNStatusBar.setTranslucent(true);
        }
      }}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-slate-50`}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        {Platform.OS === 'android' && (
          <RNStatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
        )}

        {/* ── 1. Top Emerald Gradient Header ── */}
        <LinearGradient
          colors={['#064E3B', '#047857', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            tw`pb-4 px-4.5`,
            { paddingTop: Math.max(insets.top, 14) + 8 },
          ]}
        >
          {/* Title Row */}
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <View style={tw`flex-row items-center gap-3`}>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                style={tw`w-9 h-9 rounded-full bg-white/20 border border-white/20 justify-center items-center`}
              >
                <Ionicons name="arrow-back" size={19} color="#FFFFFF" />
              </TouchableOpacity>

              <View>
                <Text style={tw`text-lg font-black text-white tracking-tight`}>My Orders</Text>
                <Text style={tw`text-[11px] font-bold text-emerald-100 mt-0.5`}>
                  {orders.length} total orders recorded
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => refetch()}
              activeOpacity={0.8}
              style={tw`w-9 h-9 rounded-full bg-white/20 border border-white/20 justify-center items-center`}
            >
              <Ionicons name="refresh" size={17} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={tw`flex-row items-center bg-white/15 rounded-2xl px-3.5 py-2 border border-white/20 mb-3`}>
            <Ionicons name="search" size={16} color="#FFFFFF" style={tw`mr-2`} />
            <TextInput
              placeholder="Search by order #, item name, store..."
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={tw`flex-1 text-xs text-white font-medium`}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Segmented Filter Tabs */}
          <View style={tw`flex-row bg-black/15 p-1 rounded-2xl`}>
            {(['all', 'active', 'delivered'] as OrderFilterTab[]).map((tab) => {
              const isSelected = activeTab === tab;
              const label = tab === 'all' ? `All (${orders.length})` : tab === 'active' ? `Active (${activeOrdersCount})` : `Delivered (${deliveredOrdersCount})`;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    tw`flex-1 py-1.8 rounded-xl items-center justify-center`,
                    isSelected ? tw`bg-white shadow-sm` : tw`bg-transparent`,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      tw`text-xs font-black capitalize`,
                      isSelected ? tw`text-emerald-900` : tw`text-white/80`,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        {/* ── 2. Orders Scrollable Stream ── */}
        <View style={tw`flex-1 bg-slate-50`}>
        {isLoading ? (
          <View style={tw`flex-1 items-center justify-center py-20`}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={tw`text-xs font-bold text-slate-400 mt-3`}>Fetching your orders...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <View style={tw`flex-1 items-center justify-center p-8`}>
            <View style={tw`w-20 h-20 rounded-full bg-emerald-50 items-center justify-center mb-4 border border-emerald-100`}>
              <Ionicons name="bag-handle-outline" size={38} color="#059669" />
            </View>
            <Text style={tw`text-base font-black text-slate-800 text-center`}>
              {searchQuery ? 'No Orders Matched' : 'No Orders in this Section'}
            </Text>
            <Text style={tw`text-xs font-medium text-slate-400 text-center mt-1 mb-5 px-4`}>
              {searchQuery
                ? `No orders matching "${searchQuery}". Try searching with a different keyword.`
                : "Explore our grocery mart catalog to place your first quick order!"}
            </Text>
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={tw`px-5 py-2 rounded-xl bg-slate-200`}
              >
                <Text style={tw`text-xs font-bold text-slate-700`}>Clear Filter</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.85}
                style={[tw`px-6 py-2.8 rounded-2xl flex-row items-center gap-2`, { backgroundColor: theme.colors.primary }]}
              >
                <Ionicons name="cart" size={16} color="#FFFFFF" />
                <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>Shop Fresh Items</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[tw`p-4`, { paddingBottom: 110 }]}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={theme.colors.primary}
              />
            }
          >
            {filteredOrders.map((order: any) => {
              const statusBadge = getStatusBadge(order.status);
              const isDelivery = order.type === 'DELIVERY';
              const active = isOrderActive(order.status);
              const activeStep = getActiveStepIndex(order.status);

              return (
                <View
                  key={order.id}
                  style={[
                    tw`bg-white rounded-3xl border border-slate-200/80 mb-4 overflow-hidden`,
                    Platform.OS === 'ios'
                      ? { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 }
                      : { elevation: 2 },
                  ]}
                >
                  {/* Active Order Progress Tracker Bar */}
                  {active && (
                    <View style={tw`bg-emerald-900/5 px-4 py-2.5 border-b border-emerald-100`}>
                      <View style={tw`flex-row items-center justify-between mb-1.5`}>
                        <View style={tw`flex-row items-center gap-1.5`}>
                          <View style={tw`w-2 h-2 rounded-full bg-emerald-500`} />
                          <Text style={tw`text-[11px] font-black text-emerald-950`}>Live Tracking Status</Text>
                        </View>
                        <Text style={tw`text-[10px] font-bold text-emerald-700`}>
                          {statusBadge.label}
                        </Text>
                      </View>

                      {/* 4-Step Visual Progress */}
                      <View style={tw`flex-row items-center justify-between mt-1 px-1`}>
                        {['Placed', 'Packed', 'On Way', 'Delivered'].map((stepName, sIdx) => {
                          const isDone = sIdx <= activeStep;
                          const isCurrent = sIdx === activeStep;

                          return (
                            <React.Fragment key={stepName}>
                              <View style={tw`items-center`}>
                                <View
                                  style={[
                                    tw`w-5 h-5 rounded-full items-center justify-center border`,
                                    isDone
                                      ? tw`bg-emerald-600 border-emerald-600`
                                      : tw`bg-slate-200 border-slate-300`,
                                  ]}
                                >
                                  <Ionicons
                                    name={isDone ? 'checkmark' : 'ellipse'}
                                    size={isDone ? 11 : 6}
                                    color={isDone ? '#FFFFFF' : '#94A3B8'}
                                  />
                                </View>
                                <Text
                                  style={[
                                    tw`text-[8px] mt-0.5 font-bold`,
                                    isCurrent
                                      ? tw`text-emerald-900 font-black`
                                      : isDone
                                      ? tw`text-emerald-700`
                                      : tw`text-slate-400`,
                                  ]}
                                >
                                  {stepName}
                                </Text>
                              </View>
                              {sIdx < 3 && (
                                <View
                                  style={[
                                    tw`flex-1 h-0.5 -mt-3 mx-1`,
                                    sIdx < activeStep ? tw`bg-emerald-600` : tw`bg-slate-200`,
                                  ]}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Card Header: Order Number & Badge */}
                  <View style={tw`p-4 pb-3 flex-row items-center justify-between border-b border-slate-100`}>
                    <TouchableOpacity
                      onPress={() => handleCopy(order.orderNumber)}
                      activeOpacity={0.7}
                      style={tw`flex-row items-center gap-1.5`}
                    >
                      <Text style={tw`text-xs font-black text-slate-900`}>{order.orderNumber}</Text>
                      <Ionicons
                        name={copiedId === order.orderNumber ? 'checkmark-circle' : 'copy-outline'}
                        size={13}
                        color={copiedId === order.orderNumber ? '#059669' : '#94A3B8'}
                      />
                    </TouchableOpacity>

                    <View style={[tw`px-2.5 py-0.8 rounded-full border flex-row items-center gap-1`, tw`${statusBadge.bg} ${statusBadge.border}`]}>
                      <Text style={[tw`text-[10px] font-black uppercase tracking-wider`, tw`${statusBadge.text}`]}>
                        {statusBadge.label}
                      </Text>
                    </View>
                  </View>

                  {/* Body Content */}
                  <View style={tw`p-4 py-3`}>
                    {/* Timestamp & Outlet Row */}
                    <View style={tw`flex-row items-center justify-between mb-2`}>
                      <View style={tw`flex-row items-center gap-1.5`}>
                        <Ionicons name="calendar-outline" size={13} color="#64748B" />
                        <Text style={tw`text-[11px] font-bold text-slate-500`}>
                          {formatDate(order.createdAt)}
                        </Text>
                      </View>

                      <View style={tw`flex-row items-center gap-1`}>
                        <Ionicons
                          name={isDelivery ? 'bicycle' : 'storefront'}
                          size={13}
                          color={isDelivery ? '#059669' : '#2563EB'}
                        />
                        <Text style={tw`text-[11px] font-bold text-slate-700`}>
                          {isDelivery ? 'Home Delivery' : 'Store Pickup'}
                        </Text>
                      </View>
                    </View>

                    {/* Outlet name */}
                    {order.store?.name && (
                      <View style={tw`flex-row items-center gap-1.5 mb-2.5`}>
                        <Ionicons name="storefront-outline" size={13} color="#047857" />
                        <Text style={tw`text-[11px] font-bold text-slate-700`} numberOfLines={1}>
                          Outlet: <Text style={tw`font-black text-slate-900`}>{order.store.name}</Text>
                        </Text>
                      </View>
                    )}

                    {/* Items List Preview */}
                    {order.items && order.items.length > 0 && (
                      <View style={tw`bg-slate-50/80 rounded-2xl p-3 border border-slate-100 mb-2`}>
                        <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5`}>
                          {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'} in this order
                        </Text>
                        {order.items.map((item: any) => (
                          <View key={item.id} style={tw`flex-row justify-between items-center py-1`}>
                            <Text style={tw`text-xs font-bold text-slate-800 flex-1 mr-2`} numberOfLines={1}>
                              • {item.name} <Text style={tw`text-slate-400 font-semibold`}>({item.unit || '1 unit'}) x{item.qty}</Text>
                            </Text>
                            <Text style={tw`text-xs font-black text-slate-900`}>
                              ₹{(item.priceAtOrder * item.qty).toFixed(0)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Delivery Destination Address */}
                    {order.address?.street && isDelivery && (
                      <View style={tw`flex-row items-center gap-1.5 pt-1`}>
                        <Ionicons name="location-outline" size={13} color="#94A3B8" />
                        <Text style={tw`text-[10px] font-medium text-slate-400 flex-1`} numberOfLines={1}>
                          Delivered to: {order.address.street}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Card Bottom Footer: Total Paid & Action Buttons */}
                  <View style={tw`px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex-row items-center justify-between`}>
                    <View>
                      <Text style={tw`text-[9px] font-black text-slate-400 uppercase tracking-wider`}>
                        Total Amount ({order.payment?.method || 'COD'})
                      </Text>
                      <Text style={[tw`text-base font-black`, { color: theme.colors.primary }]}>
                        ₹{order.totalAmount?.toFixed(0) || 0}
                      </Text>
                    </View>

                    <View style={tw`flex-row items-center gap-2`}>
                      <TouchableOpacity
                        onPress={() => setSelectedOrderDetails(order)}
                        activeOpacity={0.7}
                        style={tw`px-3 py-1.8 rounded-xl bg-white border border-slate-200`}
                      >
                        <Text style={tw`text-[11px] font-black text-slate-700`}>Details</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleReorder(order)}
                        activeOpacity={0.8}
                        style={[tw`px-3.5 py-1.8 rounded-xl flex-row items-center gap-1.5`, { backgroundColor: theme.colors.primary }]}
                      >
                        <Ionicons name="repeat" size={13} color="#FFFFFF" />
                        <Text style={tw`text-[11px] font-black text-white uppercase tracking-wider`}>
                          Reorder
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* ── 4. Order Details Receipt Modal Sheet ── */}
        {selectedOrderDetails && (
          <Modal
            visible={!!selectedOrderDetails}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setSelectedOrderDetails(null)}
          >
            <View style={tw`flex-1 bg-black/60 justify-end`}>
              <View style={tw`bg-white rounded-t-3xl p-5 max-h-[85%]`}>
                {/* Modal Title & Close */}
                <View style={tw`flex-row items-center justify-between pb-3 border-b border-slate-100`}>
                  <View>
                    <Text style={tw`text-sm font-black text-slate-900`}>
                      Order #{selectedOrderDetails.orderNumber}
                    </Text>
                    <Text style={tw`text-[10px] font-bold text-slate-400 mt-0.5`}>
                      Placed on {formatDate(selectedOrderDetails.createdAt)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedOrderDetails(null)}
                    style={tw`w-8 h-8 rounded-full bg-slate-100 items-center justify-center`}
                  >
                    <Ionicons name="close" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={tw`py-3`}>
                  {/* Store info */}
                  {selectedOrderDetails.store?.name && (
                    <View style={tw`p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 mb-3`}>
                      <Text style={tw`text-xs font-black text-emerald-900`}>{selectedOrderDetails.store.name}</Text>
                      <Text style={tw`text-[10px] font-medium text-emerald-700 mt-0.5`}>
                        {selectedOrderDetails.store.address || 'Retail Store Outlet'}
                      </Text>
                    </View>
                  )}

                  {/* Items list */}
                  <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider mb-2`}>
                    Itemized Receipt
                  </Text>
                  <View style={tw`border border-slate-100 rounded-2xl p-3 bg-slate-50 mb-3`}>
                    {selectedOrderDetails.items?.map((item: any) => (
                      <View key={item.id} style={tw`flex-row justify-between items-center py-1.5 border-b border-slate-100/80`}>
                        <View style={tw`flex-1 mr-2`}>
                          <Text style={tw`text-xs font-bold text-slate-800`}>{item.name}</Text>
                          <Text style={tw`text-[10px] text-slate-400 font-medium`}>
                            {item.unit || '1 unit'} • ₹{item.priceAtOrder} × {item.qty}
                          </Text>
                        </View>
                        <Text style={tw`text-xs font-black text-slate-900`}>
                          ₹{(item.priceAtOrder * item.qty).toFixed(0)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Bill Breakdown */}
                  <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider mb-2`}>
                    Payment Summary
                  </Text>
                  <View style={tw`border border-slate-100 rounded-2xl p-3.5 bg-slate-50 mb-4`}>
                    <View style={tw`flex-row justify-between mb-1.5`}>
                      <Text style={tw`text-xs font-medium text-slate-500`}>Subtotal</Text>
                      <Text style={tw`text-xs font-bold text-slate-800`}>
                        ₹{selectedOrderDetails.subtotal?.toFixed(0) || 0}
                      </Text>
                    </View>

                    {selectedOrderDetails.discount > 0 && (
                      <View style={tw`flex-row justify-between mb-1.5`}>
                        <Text style={tw`text-xs font-bold text-emerald-700`}>Coupon Discount</Text>
                        <Text style={tw`text-xs font-black text-emerald-700`}>
                          -₹{selectedOrderDetails.discount?.toFixed(0)}
                        </Text>
                      </View>
                    )}

                    <View style={tw`flex-row justify-between mb-1.5`}>
                      <Text style={tw`text-xs font-medium text-slate-500`}>Delivery Fee</Text>
                      <Text style={tw`text-xs font-bold text-slate-800`}>
                        {selectedOrderDetails.deliveryFee === 0 ? 'FREE' : `₹${selectedOrderDetails.deliveryFee?.toFixed(0)}`}
                      </Text>
                    </View>

                    <View style={tw`flex-row justify-between mb-2`}>
                      <Text style={tw`text-xs font-medium text-slate-500`}>Taxes & GST</Text>
                      <Text style={tw`text-xs font-bold text-slate-800`}>
                        ₹{selectedOrderDetails.taxAmount?.toFixed(0) || 0}
                      </Text>
                    </View>

                    <View style={tw`h-px bg-slate-200 my-1`} />

                    <View style={tw`flex-row justify-between items-center pt-1.5`}>
                      <Text style={tw`text-sm font-black text-slate-900`}>Total Paid</Text>
                      <Text style={[tw`text-base font-black`, { color: theme.colors.primary }]}>
                        ₹{selectedOrderDetails.totalAmount?.toFixed(0) || 0}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Modal CTA */}
                <TouchableOpacity
                  onPress={() => {
                    const orderToReorder = selectedOrderDetails;
                    setSelectedOrderDetails(null);
                    handleReorder(orderToReorder);
                  }}
                  activeOpacity={0.85}
                  style={[tw`w-full py-3.5 rounded-2xl flex-row items-center justify-center gap-2`, { backgroundColor: theme.colors.primary }]}
                >
                  <Ionicons name="repeat" size={16} color="#FFFFFF" />
                  <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
                    Reorder All Items
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
        </View>
      </View>
    </Modal>
  );
};
