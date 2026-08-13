import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Modal, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { theme } from '../constants/theme';
import tw from 'twrnc';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, addToCart, removeFromCart, clearCart, totalItems, totalAmount } = useCart();
  const [isOrdered, setIsOrdered] = useState(false);

  // Bill Calculations
  const deliveryFee = totalAmount >= 20 ? 0 : 2.00;
  const tax = totalAmount * 0.05; // 5% GST
  const grandTotal = totalAmount + deliveryFee + tax;

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
          tw`h-[88%] w-full rounded-t-3xl p-5 flex-col bg-slate-50`,
          {
            backgroundColor: theme.colors.background || '#F8FAFC',
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
                  <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-1`}>
                    {/* Cart Items List */}
                    <View style={tw`space-y-3 mb-6`}>
                      {cart.map((item) => (
                        <View
                          key={item.id}
                          style={[
                            tw`flex-row items-center bg-white p-3.5 rounded-2xl border border-slate-100/50 shadow-xs mb-3`,
                            { backgroundColor: theme.colors.cardBackground }
                          ]}
                        >
                          {/* Emoji representation */}
                          <View style={[tw`w-14 h-14 rounded-xl items-center justify-center bg-slate-50 border border-slate-100 mr-3`]}>
                            <Text style={tw`text-[32px]`}>{item.emoji}</Text>
                          </View>

                          {/* Info */}
                          <View style={tw`flex-1 mr-2`}>
                            <Text style={[tw`text-sm font-black mb-0.5`, { color: theme.colors.text }]} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <Text style={[tw`text-[10px] font-bold`, { color: theme.colors.textMuted }]}>
                              {item.weight} • ${item.price.toFixed(2)}/unit
                            </Text>
                            <Text style={[tw`text-xs font-extrabold mt-1.5`, { color: theme.colors.primaryDark }]}>
                              Subtotal: ${(item.price * item.quantity).toFixed(2)}
                            </Text>
                          </View>

                          {/* Inline Controls */}
                          <View style={[tw`flex-row items-center rounded-full border border-emerald-100 bg-emerald-50 px-1 py-0.5`]}>
                            <TouchableOpacity
                              onPress={() => removeFromCart(item.id)}
                              style={tw`p-1.5`}
                            >
                              <Ionicons name="remove" size={13} color="#047857" />
                            </TouchableOpacity>
                            <Text style={tw`text-xs font-black text-emerald-800 px-1.5`}>{item.quantity}</Text>
                            <TouchableOpacity
                              onPress={() => addToCart(item)}
                              style={tw`p-1.5`}
                            >
                              <Ionicons name="add" size={13} color="#047857" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* Bill breakdown card */}
                    <View style={[
                      tw`bg-white border border-slate-100 rounded-3xl p-5 shadow-xs mb-6`,
                      { backgroundColor: theme.colors.cardBackground }
                    ]}>
                      <Text style={[tw`text-xs font-black uppercase tracking-wider mb-3.5`, { color: theme.colors.text }]}>
                        Bill Details
                      </Text>
                      
                      <View style={tw`flex-row justify-between items-center mb-2.5`}>
                        <Text style={[tw`text-xs font-semibold`, { color: theme.colors.textMuted }]}>Items Subtotal</Text>
                        <Text style={[tw`text-xs font-extrabold`, { color: theme.colors.text }]}>${totalAmount.toFixed(2)}</Text>
                      </View>

                      <View style={tw`flex-row justify-between items-center mb-2.5`}>
                        <Text style={[tw`text-xs font-semibold`, { color: theme.colors.textMuted }]}>Delivery Charge</Text>
                        <Text style={[tw`text-xs font-extrabold`, { color: deliveryFee === 0 ? '#10B981' : theme.colors.text }]}>
                          {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                        </Text>
                      </View>

                      <View style={tw`flex-row justify-between items-center mb-3.5`}>
                        <Text style={[tw`text-xs font-semibold`, { color: theme.colors.textMuted }]}>Taxes & GST (5%)</Text>
                        <Text style={[tw`text-xs font-extrabold`, { color: theme.colors.text }]}>${tax.toFixed(2)}</Text>
                      </View>

                      {/* Divider line */}
                      <View style={tw`border-t border-dashed border-slate-200 pt-3.5 flex-row justify-between items-center`}>
                        <Text style={[tw`text-sm font-black`, { color: theme.colors.text }]}>Grand Total</Text>
                        <Text style={[tw`text-lg font-black`, { color: theme.colors.primaryDark }]}>${grandTotal.toFixed(2)}</Text>
                      </View>
                    </View>
                  </ScrollView>

                  {/* Checkout Footer Controls */}
                  <View style={tw`pt-4 border-t border-slate-100 flex-row gap-3`}>
                    <TouchableOpacity
                      style={[
                        tw`w-13 h-13 rounded-2xl justify-center items-center border border-rose-100`,
                        { backgroundColor: theme.colors.dangerLight }
                      ]}
                      onPress={() => {
                        Alert.alert(
                          "Clear Cart",
                          "Are you sure you want to empty all items from your cart?",
                          [
                            { text: "Cancel", style: "cancel" },
                            { text: "Yes, Empty", style: "destructive", onPress: clearCart }
                          ]
                        );
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        tw`flex-1 h-13 rounded-2xl flex-row justify-center items-center shadow-md`,
                        { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={handleCheckout}
                      activeOpacity={0.9}
                    >
                      <Text style={[tw`text-base font-black mr-1.5`, { color: theme.colors.white }]}>
                        Checkout (${grandTotal.toFixed(2)})
                      </Text>
                      <Ionicons name="shield-checkmark" size={20} color={theme.colors.white} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
