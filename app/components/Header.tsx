import React from 'react';
import { Text, View, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SearchBar } from './SearchBar';
import { theme } from '../constants/theme';
import tw from 'twrnc';

interface HeaderProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
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
  isLoggedIn,
  onToggleLogin,
  isSticky = false,
  onCartPress,
  searchInputRef,
}) => {
  const { totalItems, fulfillmentMode, setFulfillmentMode, selectedStore } = useCart();
  const insets = useSafeAreaInsets();

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
        <View style={tw`flex-row items-center flex-1 mr-3`}>
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
                  ? 'Home - 123 Main Street, New York'
                  : `${selectedStore.name} (${selectedStore.distance})`}
              </Text>
              <Ionicons name="chevron-down" size={14} color={theme.colors.white} />
            </View>
          </View>
        </View>

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
        onClear={() => onSearchQueryChange('')}
        inputRef={searchInputRef}
      />
    </LinearGradient>
  );
};
