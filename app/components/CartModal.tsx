import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { CustomCurvedNavBar, TabKey } from './CustomCurvedNavBar';
import { theme } from '../constants/theme';
import tw from 'twrnc';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Single Responsibility: Modal presentation for viewing cart items, pricing breakdown, and checking out.
 */
export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, addToCart, removeFromCart, clearCart, totalItems, pricing } = useCart();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isOrdered, setIsOrdered] = useState(false);

  const handleTabPress = (tab: TabKey) => {
    if (tab === 'home') {
      onClose();
      router.replace('/home');
    } else if (tab === 'search') {
      onClose();
      router.replace('/home');
    } else if (tab === 'profile') {
      onClose();
      router.replace('/profile');
    }
  };

  const handleCheckout = () => {
    setIsOrdered(true);
    setTimeout(() => {
      clearCart();
      setIsOrdered(false);
      onClose();
      Alert.alert(
        "🎉 Order Placed!",
        "Your organic groceries are being packed and will be delivered shortly.",
        [{ text: "Awesome!" }]
      );
    }, 1800);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-black/60 justify-end`}>
        <View style={[
          tw`h-[90%] w-full rounded-t-3xl p-5 flex-col bg-slate-50`,
          {
            backgroundColor: theme.colors.background || '#F8FAFC',
            paddingBottom: Math.max(insets.bottom, 12) + 76,
          }
        ]}>
          {/* Success Overlay state */}
          {isOrdered ? (
            <View style={tw`flex-1 items-center justify-center py-10`}>
              <View style={[tw`w-24 h-24 rounded-full bg-emerald-100 justify-center items-center mb-6`]}>
                <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              </View>
              <Text style={[tw`text-2xl font-black text-center mb-2`, { color: theme.colors.text }]}>
                Processing Payment...
              </Text>
              <Text style={[tw`text-sm text-center px-8`, { color: theme.colors.textMuted }]}>
                Securing your fresh organic order with our delivery partner.
              </Text>
            </View>
          ) : (
            <>
              {/* Header */}
              <View style={tw`flex-row justify-between items-center pb-4 border-b border-slate-100 mb-4`}>
                <View>
                  <Text style={[tw`text-2xl font-black`, { color: theme.colors.text }]}>My Cart</Text>
                  <Text style={[tw`text-xs font-bold mt-0.5`, { color: theme.colors.textMuted }]}>
                    {totalItems} {totalItems === 1 ? 'item' : 'items'} ready to checkout
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={[tw`w-9 h-9 rounded-full justify-center items-center bg-gray-100 border border-gray-200`]}
                >
                  <Ionicons name="close" size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>

              {totalItems === 0 ? (
                /* Empty Cart View */
                <View style={tw`flex-1 items-center justify-center py-12`}>
                  <Text style={tw`text-[72px] mb-4`}>🛒</Text>
                  <Text style={[tw`text-lg font-black mb-1`, { color: theme.colors.text }]}>Your cart is empty</Text>
                  <Text style={[tw`text-xs text-center px-10 mb-6`, { color: theme.colors.textMuted }]}>
                    Explore our categories and add fresh organic items to start shopping.
                  </Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={[tw`px-6 py-3 rounded-full`, { backgroundColor: theme.colors.primary }]}
                  >
                    <Text style={[tw`text-xs font-black uppercase tracking-wider`, { color: theme.colors.white }]}>
                      Shop Groceries
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Active Cart Contents */
                <>
                  <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-1 mb-4`}>
                    {cart.map((item) => (
                      <View
                        key={item.id}
                        style={[
                          tw`flex-row items-center justify-between p-3.5 mb-3 rounded-2xl border`,
                          {
                            backgroundColor: theme.colors.card || '#FFFFFF',
                            borderColor: theme.colors.border || '#F1F5F9',
                          }
                        ]}
                      >
                        <View style={tw`flex-row items-center gap-3`}>
                          <View style={tw`w-12 h-12 rounded-xl bg-slate-50 justify-center items-center`}>
                            <Text style={tw`text-2xl`}>{item.emoji}</Text>
                          </View>
                          <View>
                            <Text style={[tw`text-sm font-black`, { color: theme.colors.text }]}>
                              {item.name}
                            </Text>
                            <Text style={[tw`text-xs font-bold`, { color: theme.colors.textMuted }]}>
                              ${item.price.toFixed(2)} • {item.weight}
                            </Text>
                          </View>
                        </View>

                        {/* Quantity Controls */}
                        <View style={tw`flex-row items-center bg-slate-50 rounded-full p-1 border border-slate-100`}>
                          <TouchableOpacity
                            onPress={() => removeFromCart(item.id)}
                            style={[tw`w-7 h-7 rounded-full justify-center items-center bg-white shadow-2xs`]}
                          >
                            <Ionicons name="remove" size={14} color={theme.colors.text} />
                          </TouchableOpacity>
                          <Text style={[tw`px-2.5 text-xs font-black`, { color: theme.colors.text }]}>
                            {item.quantity}
                          </Text>
                          <TouchableOpacity
                            onPress={() => addToCart(item)}
                            style={[tw`w-7 h-7 rounded-full justify-center items-center shadow-2xs`, { backgroundColor: theme.colors.primary }]}
                          >
                            <Ionicons name="add" size={14} color={theme.colors.white} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}

                    {/* Order Summary breakdown */}
                    <View style={[
                      tw`p-4 rounded-2xl border border-slate-100 my-2`,
                      { backgroundColor: theme.colors.card || '#FFFFFF' }
                    ]}>
                      <Text style={[tw`text-xs font-black uppercase tracking-wider mb-3`, { color: theme.colors.textMuted }]}>
                        Bill Details
                      </Text>
                      <View style={tw`flex-row justify-between mb-2`}>
                        <Text style={[tw`text-xs font-medium`, { color: theme.colors.textMuted }]}>Item Total</Text>
                        <Text style={[tw`text-xs font-bold`, { color: theme.colors.text }]}>
                          ${pricing.subtotal.toFixed(2)}
                        </Text>
                      </View>
                      <View style={tw`flex-row justify-between mb-2`}>
                        <Text style={[tw`text-xs font-medium`, { color: theme.colors.textMuted }]}>Delivery Fee</Text>
                        <Text style={[tw`text-xs font-bold`, { color: pricing.deliveryFee === 0 ? '#10B981' : theme.colors.text }]}>
                          {pricing.deliveryFee === 0 ? 'FREE' : `$${pricing.deliveryFee.toFixed(2)}`}
                        </Text>
                      </View>
                      <View style={tw`flex-row justify-between mb-3`}>
                        <Text style={[tw`text-xs font-medium`, { color: theme.colors.textMuted }]}>Taxes & GST (5%)</Text>
                        <Text style={[tw`text-xs font-bold`, { color: theme.colors.text }]}>
                          ${pricing.tax.toFixed(2)}
                        </Text>
                      </View>
                      <View style={tw`h-px bg-slate-100 my-1`} />
                      <View style={tw`flex-row justify-between items-center mt-2`}>
                        <Text style={[tw`text-sm font-black`, { color: theme.colors.text }]}>Grand Total</Text>
                        <Text style={[tw`text-base font-black`, { color: theme.colors.primary }]}>
                          ${pricing.grandTotal.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </ScrollView>

                  {/* Checkout Button */}
                  <TouchableOpacity
                    onPress={handleCheckout}
                    style={[
                      tw`w-full py-4 rounded-full flex-row items-center justify-between px-6 shadow-md`,
                      { backgroundColor: theme.colors.primary }
                    ]}
                  >
                    <View>
                      <Text style={[tw`text-[10px] uppercase font-black text-white/80 tracking-wider`]}>
                        Total to Pay
                      </Text>
                      <Text style={[tw`text-lg font-black text-white`]}>
                        ${pricing.grandTotal.toFixed(2)}
                      </Text>
                    </View>
                    <View style={tw`flex-row items-center gap-1`}>
                      <Text style={[tw`text-sm font-black text-white uppercase tracking-wider`]}>
                        Place Order
                      </Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>

        {/* Fluid Organic Curved Bottom Navigation Bar (BNB-27 Style) on Cart */}
        <CustomCurvedNavBar activeTab="cart" onTabPress={handleTabPress} />
      </View>
    </Modal>
  );
};
