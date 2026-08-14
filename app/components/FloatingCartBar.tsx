import React, { useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../context/CartContext';
import tw from 'twrnc';

interface FloatingCartBarProps {
  onPress: () => void;
  visible?: boolean;
}

/**
 * Single Responsibility: Floating sticky mini-cart pill
 * displaying active item count, subtotal, and instant "View Cart" navigation.
 */
export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  onPress,
  visible = true,
}) => {
  const { totalItems, pricing } = useCart();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(80)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const shouldShow = visible && totalItems > 0;

  useEffect(() => {
    if (shouldShow) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [shouldShow]);

  if (!shouldShow) return null;

  // Position comfortably above the BNB-27 bottom navigation bar and active floating bubble
  const bottomOffset = Math.max(insets.bottom, 10) + 88;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        tw`absolute left-4 right-4 z-40`,
        {
          bottom: bottomOffset,
          transform: [{ translateY }, { scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.92}
        style={[
          tw`rounded-2xl overflow-hidden shadow-lg`,
          Platform.OS === 'android'
            ? { elevation: 10 }
            : {
                shadowColor: '#059669',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
              },
        ]}
      >
        <LinearGradient
          colors={['#064E3B', '#047857', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={tw`px-4 py-3 flex-row items-center justify-between`}
        >
          {/* Left Summary: Item Count & Total Amount */}
          <View style={tw`flex-row items-center gap-3`}>
            <View style={tw`w-9 h-9 rounded-xl bg-white/20 items-center justify-center border border-white/20`}>
              <Ionicons name="basket" size={19} color="#FFFFFF" />
            </View>
            <View>
              <View style={tw`flex-row items-center gap-1.5`}>
                <Text style={tw`text-[10px] font-black uppercase text-emerald-200 tracking-wider`}>
                  {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
                </Text>
                <View style={tw`w-1 h-1 rounded-full bg-emerald-300`} />
                <Text style={tw`text-sm font-black text-white`}>
                  ₹{pricing.subtotal.toFixed(0)}
                </Text>
              </View>
              <Text style={tw`text-[10px] font-medium text-white/80`}>
                {pricing.isFreeDelivery ? '🎉 FREE Delivery applied' : '⚡ 12-15 Mins Delivery'}
              </Text>
            </View>
          </View>

          {/* Right Action: View Cart CTA */}
          <View style={tw`flex-row items-center gap-1 bg-white/20 px-3 py-1.5 rounded-xl border border-white/20`}>
            <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
              View Cart
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};
