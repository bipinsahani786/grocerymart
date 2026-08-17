import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SearchBar } from './SearchBar';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { ProfileAddressesModal } from './profile/ProfileAddressesModal';
import * as Location from 'expo-location';
import { theme } from '../constants/theme';
import tw from 'twrnc';

interface HeaderProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSubmitSearch?: (query: string) => void;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
  isLoggedIn: boolean;
  onToggleLogin: () => void;
  isSticky?: boolean;
  onCartPress?: () => void;
  searchInputRef?: React.RefObject<TextInput | null>;
}

/**
 * Single Responsibility: Top Header orchestrator rendering location status,
 * fulfillment toggle, profile/cart badges, and the modular SearchBar.
 */
export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSubmitSearch,
  onSearchFocus,
  onSearchBlur,
  isLoggedIn,
  onToggleLogin,
  isSticky = false,
  onCartPress,
  searchInputRef,
}) => {
  const { totalItems, fulfillmentMode, setFulfillmentMode, selectedStore, setSelectedStore, selectedAddress, pincode, setPincode, setSelectedAddress } = useCart();
  const insets = useSafeAreaInsets();

  const [gpsAddress, setGpsAddress] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false);

  const handleFetchGpsLocation = async () => {
    try {
      setGpsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied. Showing default location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode.length > 0) {
        const addr = geocode[0];
        // Filter out Google Plus codes (e.g., G2XM+X3J)
        const isPlusCode = (val?: string | null) => !val || val.includes('+') || /^[A-Z0-9]{4,8}\+[A-Z0-9]{2,4}$/i.test(val.trim());

        const validParts: string[] = [];

        if (addr.name && !isPlusCode(addr.name) && isNaN(Number(addr.name))) {
          validParts.push(addr.name);
        }
        if (addr.street && !isPlusCode(addr.street) && !validParts.includes(addr.street)) {
          validParts.push(addr.street);
        }
        const locality = addr.district || addr.subregion;
        if (locality && !validParts.includes(locality)) {
          validParts.push(locality);
        }
        if (addr.city && !validParts.includes(addr.city)) {
          validParts.push(addr.city);
        }

        if (validParts.length === 0) {
          if (addr.city) validParts.push(addr.city);
          if (addr.region) validParts.push(addr.region);
        }

        const baseAddress = validParts.join(', ');
        const displayAddr = addr.postalCode ? `${baseAddress} (${addr.postalCode})` : baseAddress;
        
        setGpsAddress(displayAddr || 'Current Location');
        if (addr.postalCode) {
          setPincode(addr.postalCode);
          setSelectedAddress('gps');
        }
      } else {
        setGpsAddress(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setSelectedAddress('gps');
      }
    } catch (err) {
      console.error('GPS error:', err);
    } finally {
      setGpsLoading(false);
    }
  };

  React.useEffect(() => {
    if (fulfillmentMode === 'delivery' && !gpsAddress) {
      handleFetchGpsLocation();
    }
  }, [fulfillmentMode]);

  const { data: locationData } = useQuery({
    queryKey: ['location-by-pincode', pincode],
    queryFn: () => productService.fetchLocationByPincode(pincode),
    enabled: !!pincode && selectedAddress !== 'gps',
  });

  const { data: storesList = [] } = useQuery({
    queryKey: ['backend-stores', pincode],
    queryFn: () => productService.fetchStores(pincode),
  });

  const activeOutlet = storesList.length > 0 ? storesList[0] : selectedStore;

  React.useEffect(() => {
    if (storesList.length > 0 && selectedStore.name.includes('Flagship')) {
      setSelectedStore(storesList[0]);
    }
  }, [storesList]);

  return (
    <LinearGradient
      colors={
        isSticky
          ? [theme.colors.primary, theme.colors.primary, theme.colors.primary]
          : ['rgba(4, 120, 87, 0.98)', 'rgba(4, 120, 87, 0.75)', 'rgba(4, 120, 87, 0)']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        tw`px-4`,
        isSticky ? tw`pb-3` : tw`pb-7`,
        { paddingTop: Math.max(insets.top, 12) + 6 },
      ]}
    >
      {/* Top Location and Cart Bar */}
      <View style={tw`flex-row justify-between items-center mb-3`}>
        <TouchableOpacity
          onPress={() => setIsLocationModalVisible(true)}
          activeOpacity={0.85}
          style={tw`flex-row items-center flex-1 mr-3`}
        >
          <View style={[tw`w-9 h-9 rounded-full justify-center items-center`, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <Ionicons
              name={fulfillmentMode === 'delivery' ? 'location' : 'storefront'}
              size={18}
              color={theme.colors.white}
            />
          </View>
          <View style={tw`ml-2.5 flex-1`}>
            <Text style={[tw`text-[9px] font-black tracking-wider opacity-85 uppercase`, { color: theme.colors.white }]}>
              {fulfillmentMode === 'delivery' ? 'DELIVER TO HOME' : 'STORE PICKUP'}
            </Text>
            <View style={tw`flex-row items-center`}>
              <Text style={[tw`text-sm font-extrabold mr-1 max-w-[85%]`, { color: theme.colors.white }]} numberOfLines={1}>
                {fulfillmentMode === 'delivery'
                  ? gpsLoading
                    ? 'Locating...'
                    : gpsAddress || (locationData ? locationData.address : 'Locating by GPS...')
                  : `${activeOutlet.name} (${activeOutlet.distance})`}
              </Text>
              <Ionicons name="chevron-down" size={14} color={theme.colors.white} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Circles */}
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity 
            style={[tw`relative w-9 h-9 rounded-full justify-center items-center ml-2 border border-white/10`, { backgroundColor: 'rgba(255, 255, 255, 0.18)' }]} 
            onPress={onToggleLogin}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isLoggedIn ? "person" : "person-outline"}
              size={18}
              color={theme.colors.white}
            />
            <View
              style={[
                tw`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-emerald-600`,
                { 
                  backgroundColor: isLoggedIn ? '#34D399' : '#9CA3AF',
                },
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[tw`relative w-9 h-9 rounded-full justify-center items-center ml-2 border border-white/10`, { backgroundColor: 'rgba(255, 255, 255, 0.18)' }]}
            activeOpacity={0.8}
            onPress={onCartPress}
          >
            <Ionicons name="basket" size={18} color={theme.colors.white} />
            {totalItems > 0 && (
              <View
                style={[
                  tw`absolute -top-1 -right-1 min-w-[17px] h-[17px] rounded-full justify-center items-center px-0.5 border border-emerald-700`,
                  { backgroundColor: theme.colors.accent || '#F59E0B' },
                ]}
              >
                <Text style={[tw`text-[9px] font-black text-white`]}>
                  {totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Domino's Style Delivery vs Store Pickup Segmented Toggle ── */}
      {!isSticky && (
        <View style={tw`flex-row bg-black/25 p-1 rounded-2xl mb-3 border border-white/10`}>
          <TouchableOpacity
            onPress={() => setFulfillmentMode('delivery')}
            activeOpacity={0.8}
            style={[
              tw`flex-1 py-1.8 rounded-xl flex-row items-center justify-center gap-1.5`,
              fulfillmentMode === 'delivery'
                ? tw`bg-white shadow-sm`
                : tw`bg-transparent`,
            ]}
          >
            <Ionicons
              name="bicycle"
              size={14}
              color={fulfillmentMode === 'delivery' ? '#047857' : '#FFFFFF'}
            />
            <Text
              style={[
                tw`text-[10px] font-black uppercase tracking-wider`,
                fulfillmentMode === 'delivery'
                  ? tw`text-emerald-800`
                  : tw`text-white/90`,
              ]}
            >
              Delivery • 15m
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFulfillmentMode('pickup')}
            activeOpacity={0.8}
            style={[
              tw`flex-1 py-1.8 rounded-xl flex-row items-center justify-center gap-1.5`,
              fulfillmentMode === 'pickup'
                ? tw`bg-white shadow-sm`
                : tw`bg-transparent`,
            ]}
          >
            <Ionicons
              name="storefront"
              size={14}
              color={fulfillmentMode === 'pickup' ? '#047857' : '#FFFFFF'}
            />
            <Text
              style={[
                tw`text-[10px] font-black uppercase tracking-wider`,
                fulfillmentMode === 'pickup'
                  ? tw`text-emerald-800`
                  : tw`text-white/90`,
              ]}
            >
              Takeaway / Store
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Modular Standalone SearchBar Component ── */}
      <SearchBar
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        onSubmitSearch={onSubmitSearch}
        onFocus={onSearchFocus}
        onBlur={onSearchBlur}
        onClear={() => {
          onSearchQueryChange('');
          if (onSubmitSearch) onSubmitSearch('');
        }}
        inputRef={searchInputRef}
      />

      {/* ── Homepage Location Viewer Sheet ── */}
      <Modal
        visible={isLocationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsLocationModalVisible(false)}
      >
        <TouchableOpacity
          style={tw`flex-1 bg-black/60 justify-end`}
          activeOpacity={1}
          onPress={() => setIsLocationModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={tw`bg-white rounded-t-3xl p-5 pb-9 border-t border-slate-100 shadow-2xl`}
          >
            {/* Header */}
            <View style={tw`flex-row justify-between items-center pb-4 mb-4 border-b border-slate-100`}>
              <View style={tw`flex-row items-center gap-2.5`}>
                <View style={tw`w-10 h-10 rounded-2xl bg-emerald-50 items-center justify-center`}>
                  <Ionicons name="location" size={20} color="#059669" />
                </View>
                <View>
                  <Text style={tw`text-sm font-black text-slate-800`}>Location Details</Text>
                  <Text style={tw`text-[10px] font-bold text-slate-400`}>Delivering to this area</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsLocationModalVisible(false)}
                style={tw`w-8 h-8 rounded-full bg-slate-100 items-center justify-center`}
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Current Detected Address Card */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-3.5`}>
              <View style={tw`flex-row items-center justify-between mb-1.5`}>
                <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider`}>
                  📍 Current Detected Address
                </Text>
                <View style={tw`bg-emerald-100/80 px-2 py-0.5 rounded-full`}>
                  <Text style={tw`text-[9px] font-black text-emerald-800`}>
                    PIN: {pincode || '201301'}
                  </Text>
                </View>
              </View>
              <Text style={tw`text-xs font-black text-slate-800 leading-5`}>
                {gpsAddress || locationData?.address || 'Sector 62, Noida, UP (201301)'}
              </Text>
            </View>

            {/* Serving Outlet Information */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-5`}>
              <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2`}>
                🏬 Serving Store Outlet
              </Text>
              <Text style={tw`text-xs font-black text-slate-800 mb-0.5`}>
                {activeOutlet.name}
              </Text>
              <Text style={tw`text-[11px] font-medium text-slate-500 mb-2`}>
                {activeOutlet.address}
              </Text>
              <View style={tw`flex-row items-center gap-3 pt-2 border-t border-slate-200/60`}>
                <Text style={tw`text-[10px] font-bold text-emerald-700`}>
                  ⚡ 12-15 Mins Express Delivery
                </Text>
                <Text style={tw`text-[10px] font-bold text-slate-400`}>
                  • {activeOutlet.distance || '0.8 km away'}
                </Text>
              </View>
            </View>

            {/* Actions: Dual Button Row */}
            <View style={tw`flex-row items-center gap-3 mb-2.5`}>
              {/* My Addresses Button */}
              <TouchableOpacity
                onPress={() => {
                  setIsLocationModalVisible(false);
                  setIsAddressesModalOpen(true);
                }}
                activeOpacity={0.85}
                style={[
                  tw`flex-1 p-3.5 rounded-2xl border flex-row items-center gap-2.5 shadow-sm`,
                  {
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                  },
                ]}
              >
                <View
                  style={[
                    tw`w-9 h-9 rounded-xl items-center justify-center`,
                    { backgroundColor: theme.colors.primaryDark },
                  ]}
                >
                  <Ionicons name="location" size={18} color={theme.colors.white} />
                </View>
                <View style={tw`flex-1`}>
                  <Text
                    style={[
                      tw`text-xs font-black uppercase tracking-wider`,
                      { color: theme.colors.primaryDark },
                    ]}
                    numberOfLines={1}
                  >
                    My Address
                  </Text>
                  <Text style={tw`text-[10px] font-bold text-emerald-700 mt-0.5`}>
                    Saved Book
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Refresh GPS Button */}
              <TouchableOpacity
                onPress={async () => {
                  await handleFetchGpsLocation();
                }}
                disabled={gpsLoading}
                activeOpacity={0.85}
                style={[
                  tw`flex-1 p-3.5 rounded-2xl border flex-row items-center gap-2.5 shadow-sm`,
                  {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primaryDark,
                  },
                ]}
              >
                <View
                  style={[
                    tw`w-9 h-9 rounded-xl items-center justify-center`,
                    { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
                  ]}
                >
                  {gpsLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                  ) : (
                    <Ionicons name="navigate" size={18} color={theme.colors.white} />
                  )}
                </View>
                <View style={tw`flex-1`}>
                  <Text
                    style={[
                      tw`text-xs font-black uppercase tracking-wider`,
                      { color: theme.colors.white },
                    ]}
                    numberOfLines={1}
                  >
                    {gpsLoading ? 'Locating...' : 'Refresh GPS'}
                  </Text>
                  <Text style={[tw`text-[10px] font-bold opacity-90`, { color: theme.colors.white }]}>
                    Live Location
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Done Dismiss Button */}
            <TouchableOpacity
              onPress={() => setIsLocationModalVisible(false)}
              activeOpacity={0.8}
              style={[
                tw`py-3 rounded-2xl items-center justify-center border`,
                { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[tw`text-xs font-black`, { color: theme.colors.textLight }]}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── My Addresses Full Page Modal ── */}
      <ProfileAddressesModal
        visible={isAddressesModalOpen}
        onClose={() => setIsAddressesModalOpen(false)}
      />
    </LinearGradient>
  );
};
