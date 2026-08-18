import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Modal, ActivityIndicator, ScrollView } from 'react-native';
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

interface AddressItem {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
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
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false);

  // Fetch real saved addresses from database
  const { data: savedAddresses = [] } = useQuery<AddressItem[]>({
    queryKey: ['customer-addresses'],
    queryFn: () => productService.fetchCustomerAddresses(),
  });

  const handleFetchGpsLocation = async (andCloseModal = false) => {
    try {
      setGpsLoading(true);
      setLocationError(null);

      // Check if location services (GPS hardware) is enabled on device
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        setLocationError('Failed to detect location');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Failed to detect location');
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
        // Filter out raw Plus Codes like "87G8+9F"
        const isPlusCode = (val?: string | null) =>
          !val || val.includes('+') || /^[A-Z0-9]{4,8}\+[A-Z0-9]{2,4}$/i.test(val.trim());

        const validParts: string[] = [];

        // 1. House/Plot/Building number if available
        if (addr.streetNumber && !isPlusCode(addr.streetNumber) && !validParts.includes(addr.streetNumber.trim())) {
          validParts.push(addr.streetNumber.trim());
        }

        // 2. Name / Building / House name
        if (addr.name && !isPlusCode(addr.name) && !validParts.includes(addr.name.trim())) {
          validParts.push(addr.name.trim());
        }

        // 3. Street / Road name
        if (addr.street && !isPlusCode(addr.street) && !validParts.includes(addr.street.trim())) {
          validParts.push(addr.street.trim());
        }

        // 4. Locality / District / Subregion
        const locality = addr.district || addr.subregion;
        if (locality && !isPlusCode(locality) && !validParts.includes(locality.trim())) {
          validParts.push(locality.trim());
        }

        // 5. City
        if (addr.city && !validParts.includes(addr.city.trim())) {
          validParts.push(addr.city.trim());
        }

        if (validParts.length === 0) {
          if (addr.city) validParts.push(addr.city.trim());
          if (addr.region) validParts.push(addr.region.trim());
        }

        const baseAddress = validParts.join(', ');
        const displayAddr = addr.postalCode ? `${baseAddress} (${addr.postalCode})` : baseAddress;
        
        setGpsAddress(displayAddr || 'Current Location');
        setSelectedAddress(displayAddr || 'Current Location');
        setLocationError(null);
        if (addr.postalCode) {
          setPincode(addr.postalCode);
        } else if (addr.city || addr.district) {
          setPincode(addr.city || addr.district || '');
        }
        if (andCloseModal) {
          setIsLocationModalVisible(false);
        }
      } else {
        setGpsAddress(null);
        setLocationError('Failed to detect location');
      }
    } catch (err) {
      console.error('Location error:', err);
      setLocationError('Failed to detect location');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSelectSavedAddress = (addr: AddressItem) => {
    const fullAddr = `${addr.street}, ${addr.city}, ${addr.state}${addr.zipCode ? ` - ${addr.zipCode}` : ''}`;
    setSelectedAddress(fullAddr);
    setGpsAddress(fullAddr);
    setLocationError(null);
    if (addr.zipCode) {
      setPincode(addr.zipCode.trim());
    } else {
      const match = fullAddr.match(/\b\d{6}\b/);
      if (match) {
        setPincode(match[0]);
      } else {
        setPincode(addr.city || addr.street);
      }
    }
    setIsLocationModalVisible(false);
  };

  React.useEffect(() => {
    if (fulfillmentMode === 'delivery' && !gpsAddress && !selectedAddress) {
      handleFetchGpsLocation();
    }
  }, [fulfillmentMode]);

  const { data: storesList = [] } = useQuery({
    queryKey: ['backend-stores', pincode],
    queryFn: () => productService.fetchStores(pincode),
  });

  const activeOutlet = storesList.length > 0 ? storesList[0] : selectedStore;

  React.useEffect(() => {
    if (storesList.length > 0) {
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
          <View style={tw`ml-2.5 flex-1 pr-1`}>
            <Text style={[tw`text-[9px] font-black tracking-wider opacity-85 uppercase`, { color: theme.colors.white }]}>
              {fulfillmentMode === 'delivery' ? 'DELIVER TO' : 'STORE PICKUP'}
            </Text>
            <View style={tw`flex-row items-center flex-1`}>
              <Text
                style={[tw`text-sm font-extrabold mr-1 flex-1`, { color: theme.colors.white }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {fulfillmentMode === 'delivery'
                  ? gpsLoading
                    ? 'Detecting location...'
                    : (selectedAddress || gpsAddress || (pincode ? `Delivery Area (${pincode})` : (locationError || 'Failed to detect location')))
                  : (activeOutlet ? `${activeOutlet.name} (${activeOutlet.distance})` : 'Select a pickup store')}
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
                tw`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white`,
                { backgroundColor: isLoggedIn ? (theme.colors.success || '#10B981') : (theme.colors.accent || '#F59E0B') },
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[tw`relative w-9 h-9 rounded-full justify-center items-center ml-2 border border-white/10`, { backgroundColor: 'rgba(255, 255, 255, 0.18)' }]}
            activeOpacity={0.8}
            onPress={onCartPress}
          >
            <Ionicons name="cart" size={18} color={theme.colors.white} />
            {totalItems > 0 && (
              <View
                style={[
                  tw`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full items-center justify-center border border-white`,
                  { backgroundColor: theme.colors.accent || '#F59E0B' },
                ]}
              >
                <Text style={[tw`text-[9px] font-black`, { color: theme.colors.white }]}>
                  {totalItems > 99 ? '99+' : totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modern Switcher: Delivery vs Pick-Up */}
      <View style={[tw`flex-row p-1 rounded-2xl mb-3 border border-white/10`, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
        <TouchableOpacity
          onPress={() => setFulfillmentMode('delivery')}
          activeOpacity={0.9}
          style={[
            tw`flex-1 flex-row items-center justify-center py-1.5 rounded-xl gap-1.5`,
            fulfillmentMode === 'delivery' ? tw`bg-white shadow-sm` : tw`bg-transparent`,
          ]}
        >
          <Ionicons
            name="bicycle"
            size={14}
            color={fulfillmentMode === 'delivery' ? theme.colors.primaryDark : theme.colors.white}
          />
          <Text
            style={[
              tw`text-xs font-black tracking-wide`,
              {
                color:
                  fulfillmentMode === 'delivery'
                    ? theme.colors.primaryDark
                    : theme.colors.white,
              },
            ]}
          >
            Instant Delivery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFulfillmentMode('pickup')}
          activeOpacity={0.9}
          style={[
            tw`flex-1 flex-row items-center justify-center py-1.5 rounded-xl gap-1.5`,
            fulfillmentMode === 'pickup' ? tw`bg-white shadow-sm` : tw`bg-transparent`,
          ]}
        >
          <Ionicons
            name="storefront"
            size={14}
            color={fulfillmentMode === 'pickup' ? theme.colors.primaryDark : theme.colors.white}
          />
          <Text
            style={[
              tw`text-xs font-black tracking-wide`,
              {
                color:
                  fulfillmentMode === 'pickup'
                    ? theme.colors.primaryDark
                    : theme.colors.white,
              },
            ]}
          >
            Takeaway
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Search Bar Component */}
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

      {/* ── Real-World App Delivery Location Bottom Sheet ── */}
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
            style={[
              tw`bg-white rounded-t-3xl p-5 border-t border-slate-100 shadow-2xl`,
              { maxHeight: '85%' },
            ]}
          >
            {/* Header */}
            <View style={tw`flex-row justify-between items-center pb-3.5 mb-3 border-b border-slate-100`}>
              <View style={tw`flex-row items-center gap-2.5`}>
                <View style={tw`w-10 h-10 rounded-2xl bg-emerald-50 items-center justify-center`}>
                  <Ionicons name="location" size={20} color="#059669" />
                </View>
                <View>
                  <Text style={tw`text-sm font-black text-slate-800`}>Change Delivery Location</Text>
                  <Text style={tw`text-[10px] font-bold text-slate-400`}>Select saved address or detect via GPS</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsLocationModalVisible(false)}
                style={tw`w-8 h-8 rounded-full bg-slate-100 items-center justify-center`}
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-6`}>
              {/* 1. Detect Current GPS Location Option */}
              <TouchableOpacity
                onPress={() => handleFetchGpsLocation(true)}
                disabled={gpsLoading}
                activeOpacity={0.85}
                style={tw`p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-3.5 flex-row items-center justify-between shadow-2xs`}
              >
                <View style={tw`flex-row items-center gap-3 flex-1 pr-2`}>
                  <View style={tw`w-10 h-10 rounded-xl bg-emerald-600 items-center justify-center`}>
                    {gpsLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="navigate" size={20} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xs font-black text-emerald-950 uppercase tracking-wider`}>
                      {gpsLoading ? 'Detecting Location...' : 'Use Current Location'}
                    </Text>
                    <Text style={tw`text-[11px] text-emerald-700 font-bold mt-0.5`} numberOfLines={1}>
                      {gpsAddress || 'Auto-detect via phone GPS'}
                    </Text>
                  </View>
                </View>
                <View style={tw`bg-emerald-600 px-3 py-1.5 rounded-full`}>
                  <Text style={tw`text-[10px] font-black text-white uppercase tracking-wider`}>
                    {gpsLoading ? 'Detecting' : 'Detect'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 2. Saved Addresses List */}
              <View style={tw`mb-3.5`}>
                <View style={tw`flex-row items-center justify-between mb-2`}>
                  <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider`}>
                    Saved Addresses ({savedAddresses.length})
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsLocationModalVisible(false);
                      setIsAddressesModalOpen(true);
                    }}
                  >
                    <Text style={tw`text-[11px] font-black text-emerald-600`}>+ Add New</Text>
                  </TouchableOpacity>
                </View>

                {savedAddresses.length === 0 ? (
                  <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-100 items-center justify-center`}>
                    <Text style={tw`text-xs font-bold text-slate-400`}>No saved addresses found</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setIsLocationModalVisible(false);
                        setIsAddressesModalOpen(true);
                      }}
                      style={tw`mt-2 py-1.5 px-4 rounded-xl bg-emerald-600`}
                    >
                      <Text style={tw`text-xs font-black text-white`}>+ Add Delivery Address</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  savedAddresses.map((addr) => {
                    const isSelected = selectedAddress === addr.street;
                    return (
                      <TouchableOpacity
                        key={addr.id}
                        onPress={() => handleSelectSavedAddress(addr)}
                        activeOpacity={0.85}
                        style={[
                          tw`p-3.5 rounded-2xl border mb-2 flex-row items-center justify-between shadow-2xs`,
                          isSelected ? tw`bg-emerald-50/40 border-emerald-600` : tw`bg-slate-50/80 border-slate-100`,
                        ]}
                      >
                        <View style={tw`flex-row items-center gap-3 flex-1 pr-3`}>
                          <View style={[tw`w-9 h-9 rounded-xl items-center justify-center`, { backgroundColor: isSelected ? '#059669' : '#E2E8F0' }]}>
                            <Ionicons
                              name="location"
                              size={18}
                              color={isSelected ? '#FFFFFF' : '#64748B'}
                            />
                          </View>
                          <View style={tw`flex-1`}>
                            <View style={tw`flex-row items-center gap-2 mb-0.5`}>
                              <Text style={tw`text-xs font-black text-slate-800`} numberOfLines={1}>
                                {addr.street}
                              </Text>
                              <View style={tw`bg-slate-200/80 px-2 py-0.5 rounded-md`}>
                                <Text style={tw`text-[9px] font-black text-slate-600`}>PIN: {addr.zipCode}</Text>
                              </View>
                            </View>
                            <Text style={tw`text-[10px] text-slate-500 font-bold`} numberOfLines={1}>
                              {addr.city}, {addr.state}
                            </Text>
                          </View>
                        </View>

                        <View style={[
                          tw`px-3 py-1.5 rounded-full border`,
                          isSelected ? tw`bg-emerald-600 border-emerald-600` : tw`bg-white border-slate-200`,
                        ]}>
                          <Text style={[
                            tw`text-[10px] font-black uppercase tracking-wider`,
                            isSelected ? tw`text-white` : tw`text-slate-600`,
                          ]}>
                            {isSelected ? 'Delivering' : 'Deliver Here'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              {/* 3. Nearest Serving Store Outlet Card */}
              {activeOutlet && (
                <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-2`}>
                  <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5`}>
                    🏬 Nearest Serving Outlet for this Location
                  </Text>
                  <Text style={tw`text-xs font-black text-slate-800 mb-0.5`}>
                    {activeOutlet.name}
                  </Text>
                  <Text style={tw`text-[11px] font-medium text-slate-500 mb-2`}>
                    {activeOutlet.address}
                  </Text>
                  <View style={tw`flex-row items-center gap-3 pt-2 border-t border-slate-200/60`}>
                    <Text style={tw`text-[10px] font-bold text-emerald-700`}>
                      ⚡ 10-15 Mins Express Delivery
                    </Text>
                    <Text style={tw`text-[10px] font-bold text-slate-400`}>
                      • {activeOutlet.distance || 'Nearest Hub'}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Full-Page Profile Addresses Modal */}
      <ProfileAddressesModal
        visible={isAddressesModalOpen}
        onClose={() => setIsAddressesModalOpen(false)}
      />
    </LinearGradient>
  );
};
