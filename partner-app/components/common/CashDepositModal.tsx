import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Linking,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface CashDepositModalProps {
  visible: boolean;
  onClose: () => void;
}

type DepositMethod = 'UPI' | 'QR' | 'STORE';

export const CashDepositModal: React.FC<CashDepositModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { earningsSummary, depositCash } = useDeliveryContext();
  const [depositAmount, setDepositAmount] = useState(
    (earningsSummary.cashCollected || 450).toString()
  );
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const safeTop = Math.max(statusBarHeight, insets.top, 14);

  const quickAmounts = [
    { label: `Full (₹${earningsSummary.cashCollected || 450})`, value: (earningsSummary.cashCollected || 450).toString() },
    { label: '₹300', value: '300' },
    { label: '₹200', value: '200' },
    { label: '₹100', value: '100' },
  ];

  const recentDeposits = [
    { id: '1', title: 'UPI Deposit (Google Pay)', date: 'Today, 01:30 PM', amount: 1450, status: 'SETTLED' },
    { id: '2', title: 'Dark Store Counter Vault', date: 'Yesterday, 08:15 PM', amount: 2100, status: 'SETTLED' },
    { id: '3', title: 'UPI Deposit (PhonePe)', date: '28 Aug, 09:00 PM', amount: 1800, status: 'SETTLED' },
  ];

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      depositCash(amt);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  const handleOpenUPI = () => {
    const upiUrl = `upi://pay?pa=partner.settlement@icici&pn=GroceryMart&am=${depositAmount}&cu=INR&tn=COD_Deposit_${Date.now()}`;
    Linking.openURL(upiUrl).catch(() => {
      handleDeposit();
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={tw`flex-1 bg-white`}>
        {/* ================= 1. FULL-SCREEN EMERALD APP BAR ================= */}
        <View
          style={[
            tw`px-4 pb-3.5 bg-[#047857] flex-row items-center justify-between shadow-md`,
            { paddingTop: safeTop + 6 },
          ]}
        >
          <View style={tw`flex-row items-center flex-1 mr-2`}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={tw`w-8 h-8 rounded-full bg-emerald-800 items-center justify-center mr-2.5`}
            >
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={tw`flex-1`}>
              <Text style={[Typography.cardTitle, { color: '#FFFFFF', fontSize: 15, fontWeight: '900' }]}>
                Deposit COD Cash
              </Text>
              <Text style={[Typography.caption, { color: '#D1FAE5', fontSize: 10 }]}>
                GroceryMart Partner Settlement
              </Text>
            </View>
          </View>

          <View style={tw`px-2.5 py-1 rounded-full bg-emerald-800 border border-emerald-600`}>
            <Text style={[Typography.badge, { color: '#A7F3D0', fontSize: 9.5 }]}>
              Instant Settlement
            </Text>
          </View>
        </View>

        {isSuccess ? (
          <View style={tw`flex-1 items-center justify-center p-6`}>
            <View style={tw`w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-4`}>
              <Ionicons name="checkmark-circle" size={36} color="#047857" />
            </View>
            <Text style={[Typography.cardTitle, { color: '#047857', fontSize: 18, fontWeight: '900' }]}>
              Deposit Successful!
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 12, marginTop: 4, textAlign: 'center' }]}>
              ₹{depositAmount} credited to GroceryMart Settlement Vault. Floating limit refreshed.
            </Text>
          </View>
        ) : (
          <View style={tw`flex-1 justify-between`}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                tw`p-4 gap-4`,
                { paddingBottom: 100 },
              ]}
            >
              {/* ================= 2. HERO FLOATING CASH CARD ================= */}
              <View style={tw`p-4 rounded-3xl bg-amber-50 border border-amber-200 shadow-sm`}>
                <View style={tw`flex-row justify-between items-center mb-1`}>
                  <Text style={[Typography.caption, { color: '#92400E', fontSize: 10.5, fontWeight: '800' }]}>
                    CURRENT FLOATING COD CASH
                  </Text>
                  <View style={tw`px-2 py-0.5 rounded-md bg-amber-200/80`}>
                    <Text style={[Typography.badge, { color: '#78350F', fontSize: 9 }]}>
                      Max Limit: ₹1,500
                    </Text>
                  </View>
                </View>

                <View style={tw`flex-row items-baseline mt-1.5`}>
                  <Text style={[Typography.amountLarge, { color: '#B45309', fontSize: 32, fontWeight: '900' }]}>
                    ₹{earningsSummary.cashCollected || 450}
                  </Text>
                  <Text style={[Typography.caption, { color: '#92400E', fontSize: 12, marginLeft: 6 }]}>
                    (₹{1500 - (earningsSummary.cashCollected || 450)} safe buffer remaining)
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={tw`h-2 bg-amber-200 rounded-full mt-3 overflow-hidden`}>
                  <View
                    style={[
                      tw`h-full rounded-full`,
                      {
                        width: `${Math.min(100, ((earningsSummary.cashCollected || 450) / 1500) * 100)}%`,
                        backgroundColor: '#D97706',
                      },
                    ]}
                  />
                </View>
              </View>

              {/* ================= 3. ENTER AMOUNT & QUICK CHIPS ================= */}
              <View>
                <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800', marginBottom: 6 }]}>
                  ENTER DEPOSIT AMOUNT (₹)
                </Text>

                <View style={tw`flex-row items-center p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-2.5`}>
                  <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 20, marginRight: 8 }]}>
                    ₹
                  </Text>
                  <TextInput
                    value={depositAmount}
                    onChangeText={setDepositAmount}
                    keyboardType="numeric"
                    placeholder="Enter deposit amount"
                    placeholderTextColor="#94A3B8"
                    style={tw`flex-1 text-lg font-black text-slate-900 p-0`}
                  />
                </View>

                {/* Quick Selection Chips */}
                <View style={tw`flex-row gap-2`}>
                  {quickAmounts.map((q, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      onPress={() => setDepositAmount(q.value)}
                      style={[
                        tw`flex-1 py-2 rounded-xl items-center justify-center border`,
                        {
                          backgroundColor: depositAmount === q.value ? '#ECFDF5' : '#F8FAFC',
                          borderColor: depositAmount === q.value ? '#10B981' : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          Typography.caption,
                          {
                            color: depositAmount === q.value ? '#047857' : '#475569',
                            fontSize: 10,
                            fontWeight: depositAmount === q.value ? '800' : '600',
                          },
                        ]}
                      >
                        {q.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* ================= 4. PAYMENT CHANNEL SELECTION ================= */}
              <View>
                <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800', marginBottom: 6 }]}>
                  SELECT PAYMENT CHANNEL
                </Text>

                <View style={tw`gap-2.5`}>
                  {/* Channel 1: UPI */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setSelectedMethod('UPI')}
                    style={[
                      tw`p-3.5 rounded-2xl border flex-row items-center justify-between shadow-sm`,
                      {
                        backgroundColor: selectedMethod === 'UPI' ? '#ECFDF5' : '#FFFFFF',
                        borderColor: selectedMethod === 'UPI' ? '#10B981' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={tw`flex-row items-center flex-1 mr-2`}>
                      <View style={tw`w-9 h-9 rounded-xl bg-emerald-100 items-center justify-center mr-3`}>
                        <Ionicons name="flash" size={16} color="#047857" />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                          Instant UPI Apps
                        </Text>
                        <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                          Google Pay • PhonePe • Paytm • CRED
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name={selectedMethod === 'UPI' ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={selectedMethod === 'UPI' ? '#047857' : '#CBD5E1'}
                    />
                  </TouchableOpacity>

                  {/* Channel 2: QR */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setSelectedMethod('QR')}
                    style={[
                      tw`p-3.5 rounded-2xl border flex-row items-center justify-between shadow-sm`,
                      {
                        backgroundColor: selectedMethod === 'QR' ? '#ECFDF5' : '#FFFFFF',
                        borderColor: selectedMethod === 'QR' ? '#10B981' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={tw`flex-row items-center flex-1 mr-2`}>
                      <View style={tw`w-9 h-9 rounded-xl bg-blue-100 items-center justify-center mr-3`}>
                        <Ionicons name="qr-code" size={16} color="#2563EB" />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                          Dynamic Store QR Code
                        </Text>
                        <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                          Scan & Pay at Dark Store Desk
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name={selectedMethod === 'QR' ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={selectedMethod === 'QR' ? '#047857' : '#CBD5E1'}
                    />
                  </TouchableOpacity>

                  {/* Channel 3: Store Cash Counter */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setSelectedMethod('STORE')}
                    style={[
                      tw`p-3.5 rounded-2xl border flex-row items-center justify-between shadow-sm`,
                      {
                        backgroundColor: selectedMethod === 'STORE' ? '#ECFDF5' : '#FFFFFF',
                        borderColor: selectedMethod === 'STORE' ? '#10B981' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={tw`flex-row items-center flex-1 mr-2`}>
                      <View style={tw`w-9 h-9 rounded-xl bg-purple-100 items-center justify-center mr-3`}>
                        <Ionicons name="storefront" size={16} color="#7C3AED" />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                          Dark Store Cash Vault Handover
                        </Text>
                        <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                          Physical handover to Store Lead
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name={selectedMethod === 'STORE' ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={selectedMethod === 'STORE' ? '#047857' : '#CBD5E1'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ================= 5. RECENT DEPOSITS PASSBOOK ================= */}
              <View style={tw`pt-2`}>
                <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800', marginBottom: 6 }]}>
                  RECENT DEPOSIT SETTLEMENTS
                </Text>

                <View style={tw`p-3 rounded-2xl bg-slate-50 border border-slate-200 gap-2`}>
                  {recentDeposits.map((item) => (
                    <View key={item.id} style={tw`flex-row justify-between items-center py-1.5 border-b border-slate-100`}>
                      <View style={tw`flex-row items-center flex-1 mr-2`}>
                        <Ionicons name="checkmark-circle" size={15} color="#047857" style={tw`mr-2`} />
                        <View style={tw`flex-1`}>
                          <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11 }]}>
                            {item.title}
                          </Text>
                          <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
                            {item.date}
                          </Text>
                        </View>
                      </View>
                      <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 12 }]}>
                        -₹{item.amount}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* ================= FIXED BOTTOM ACTION DOCK ================= */}
            <View
              style={[
                tw`p-4 bg-white border-t border-slate-200 flex-row gap-3 shadow-lg`,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={tw`flex-1 py-3.5 rounded-2xl bg-slate-100 border border-slate-200 items-center justify-center`}
              >
                <Text style={[Typography.buttonText, { color: '#64748B', fontSize: 12 }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={selectedMethod === 'UPI' ? handleOpenUPI : handleDeposit}
                disabled={isProcessing}
                style={tw`flex-2 py-3.5 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-md`}
              >
                <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" style={tw`mr-1.5`} />
                <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 13, fontWeight: '900' }]}>
                  {isProcessing ? 'Processing...' : `PAY ₹${depositAmount} & CLEAR`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};
