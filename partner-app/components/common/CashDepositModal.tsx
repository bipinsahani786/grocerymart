import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  Share,
  ActivityIndicator,
  StyleSheet,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import Svg, { Path, Rect, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface CashDepositModalProps {
  visible: boolean;
  onClose: () => void;
}

type DepositTab = 'deposit' | 'passbook';
type FlowStep =
  | 'CONFIG'
  | 'UPI_APPS'
  | 'QR_CODE'
  | 'STORE_COUNTER'
  | 'VIRTUAL_IMPS'
  | 'PROCESSING'
  | 'SUCCESS';

type PaymentChannel = 'UPI' | 'QR' | 'STORE' | 'IMPS';

export interface UPITransaction {
  id: string;
  title: string;
  payee: string;
  amount: number;
  type: 'DEPOSIT' | 'COLLECTION';
  dateStr: string;
  timeStr: string;
  section: string;
  method: string;
  appType: 'GPAY' | 'PHONEPE' | 'PAYTM' | 'CRED' | 'STORE' | 'IMPS';
  refNumber: string;
  utr: string;
  bankInfo: string;
  status: 'SUCCESS' | 'SETTLED' | 'PENDING';
}

const INITIAL_PASSBOOK_DATA: UPITransaction[] = [
  {
    id: 'TXN-UPI-8849201',
    title: 'GroceryMart Logistics Pvt Ltd',
    payee: 'partner.settlement@icici',
    amount: 1450,
    type: 'DEPOSIT',
    dateStr: 'Today, 31 Aug 2026',
    timeStr: '01:45 PM',
    section: 'Today',
    method: 'UPI (Google Pay)',
    appType: 'GPAY',
    refNumber: 'GPay-9823481029',
    utr: '492019481902',
    bankInfo: 'HDFC Bank •• 4921',
    status: 'SUCCESS',
  },
  {
    id: 'TXN-UPI-7719204',
    title: 'Dark Store Cash Counter #04',
    payee: 'Koramangala Hub Vault',
    amount: 2100,
    type: 'DEPOSIT',
    dateStr: 'Yesterday, 30 Aug 2026',
    timeStr: '08:20 PM',
    section: 'Yesterday',
    method: 'Dark Store Counter #04',
    appType: 'STORE',
    refNumber: 'DS-HUB4-77192',
    utr: 'DS4-883920192',
    bankInfo: 'Cash Handover to Lead Ramesh',
    status: 'SETTLED',
  },
  {
    id: 'TXN-COD-6618291',
    title: 'Customer COD Collection - Order #GM-8291',
    payee: 'Delivered to Priya Sharma',
    amount: 480,
    type: 'COLLECTION',
    dateStr: 'Yesterday, 30 Aug 2026',
    timeStr: '06:15 PM',
    section: 'Yesterday',
    method: 'Cash Received at Doorstep',
    appType: 'STORE',
    refNumber: 'ORD-GM-8291',
    utr: 'COD-IN-82910',
    bankInfo: 'Added to Floating COD Cash',
    status: 'SUCCESS',
  },
  {
    id: 'TXN-UPI-5510294',
    title: 'GroceryMart Logistics Pvt Ltd',
    payee: 'partner.settlement@icici',
    amount: 1800,
    type: 'DEPOSIT',
    dateStr: '28 Aug 2026',
    timeStr: '09:10 PM',
    section: 'Earlier This Week',
    method: 'UPI (PhonePe)',
    appType: 'PHONEPE',
    refNumber: 'PhonePe-3829104812',
    utr: '382910481920',
    bankInfo: 'State Bank of India •• 1092',
    status: 'SUCCESS',
  },
  {
    id: 'TXN-UPI-4409182',
    title: 'GroceryMart Virtual Account IMPS',
    payee: 'GPMART9876543210',
    amount: 2500,
    type: 'DEPOSIT',
    dateStr: '25 Aug 2026',
    timeStr: '11:30 AM',
    section: 'August 2026',
    method: 'NetBanking IMPS',
    appType: 'IMPS',
    refNumber: 'IMPS-20260825-9921',
    utr: '20260825992190',
    bankInfo: 'ICICI Bank •• 8820',
    status: 'SUCCESS',
  },
];

export const CashDepositModal: React.FC<CashDepositModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { earningsSummary, depositCash } = useDeliveryContext();

  const maxCodLimit = 2000;
  const currentCash = earningsSummary?.cashCollected ?? 1240;

  // Tabs & Steps
  const [activeTab, setActiveTab] = useState<DepositTab>('deposit');
  const [currentStep, setCurrentStep] = useState<FlowStep>('CONFIG');
  const [selectedMethod, setSelectedMethod] = useState<PaymentChannel>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM' | 'CRED'>('GPAY');

  // Input amount
  const [depositAmount, setDepositAmount] = useState<string>(
    currentCash > 0 ? currentCash.toString() : '500'
  );
  const [amountError, setAmountError] = useState<string | null>(null);

  // Passbook data & selected transaction for detail modal
  const [passbookList, setPassbookList] = useState<UPITransaction[]>(INITIAL_PASSBOOK_DATA);
  const [selectedTxn, setSelectedTxn] = useState<UPITransaction | null>(null);
  const [passbookFilter, setPassbookFilter] = useState<'ALL' | 'DEPOSIT' | 'COLLECTION'>('ALL');

  // QR Timer
  const [qrSecondsLeft, setQrSecondsLeft] = useState(300);

  // Processing stage
  const [processingStage, setProcessingStage] = useState(1);
  const [lastTxn, setLastTxn] = useState<UPITransaction | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (visible) {
      setCurrentStep('CONFIG');
      setActiveTab('deposit');
      setDepositAmount(currentCash > 0 ? currentCash.toString() : '500');
      setAmountError(null);
      setQrSecondsLeft(300);
      setSelectedTxn(null);
    }
  }, [visible, currentCash]);

  // QR Timer
  useEffect(() => {
    let interval: any;
    if (currentStep === 'QR_CODE' && qrSecondsLeft > 0) {
      interval = setInterval(() => {
        setQrSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, qrSecondsLeft]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToastMessage(null));
  };

  const copyText = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    showToast(`Copied ${label}`);
  };

  const handleSelectPreset = (amt: number) => {
    setDepositAmount(amt.toString());
    setAmountError(null);
  };

  const handleProceed = () => {
    const amt = parseFloat(depositAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setAmountError('Please enter a valid deposit amount');
      return;
    }
    if (currentCash > 0 && amt > currentCash) {
      setAmountError(`Amount exceeds ₹${currentCash} in hand`);
      return;
    }
    setAmountError(null);

    if (selectedMethod === 'UPI') setCurrentStep('UPI_APPS');
    else if (selectedMethod === 'QR') {
      setQrSecondsLeft(300);
      setCurrentStep('QR_CODE');
    } else if (selectedMethod === 'STORE') setCurrentStep('STORE_COUNTER');
    else if (selectedMethod === 'IMPS') setCurrentStep('VIRTUAL_IMPS');
  };

  const startProcessingSimulation = (methodLabel: string, appType: 'GPAY' | 'PHONEPE' | 'PAYTM' | 'CRED' | 'STORE' | 'IMPS') => {
    const amt = parseFloat(depositAmount) || currentCash;
    const now = new Date();
    const newTxnId = `TXN-UPI-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newUtr = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const newRecord: UPITransaction = {
      id: newTxnId,
      title: methodLabel.includes('Store') ? 'Dark Store Cash Counter #04' : 'GroceryMart Logistics Pvt Ltd',
      payee: methodLabel.includes('Store') ? 'Koramangala Hub Vault' : 'partner.settlement@icici',
      amount: amt,
      type: 'DEPOSIT',
      dateStr: 'Today, ' + now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      section: 'Today',
      method: methodLabel,
      appType,
      refNumber: `REF-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      utr: newUtr,
      bankInfo: methodLabel.includes('Store') ? 'Cash Handover to Lead Ramesh' : 'HDFC Bank •• 4921',
      status: 'SUCCESS',
    };

    setLastTxn(newRecord);
    setCurrentStep('PROCESSING');
    setProcessingStage(1);

    setTimeout(() => {
      setProcessingStage(2);
      setTimeout(() => {
        setProcessingStage(3);
        setTimeout(() => {
          depositCash(amt);
          setPassbookList((prev) => [newRecord, ...prev]);
          setCurrentStep('SUCCESS');
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 45,
            useNativeDriver: true,
          }).start();
        }, 800);
      }, 800);
    }, 800);
  };

  const handleShareReceipt = async (txn: UPITransaction) => {
    try {
      await Share.share({
        message: `GroceryMart COD Settlement Receipt\nTxn ID: ${txn.id}\nUTR: ${txn.utr}\nAmount: ₹${txn.amount}\nStatus: Paid & Settled\nDate: ${txn.dateStr} at ${txn.timeStr}`,
      });
    } catch (e) {}
  };

  // Filtered passbook
  const filteredPassbook = useMemo(() => {
    if (passbookFilter === 'ALL') return passbookList;
    return passbookList.filter((item) => item.type === passbookFilter);
  }, [passbookList, passbookFilter]);

  // Group passbook by sections (Today, Yesterday, Earlier)
  const groupedSections = useMemo(() => {
    const groups: { [key: string]: UPITransaction[] } = {};
    filteredPassbook.forEach((item) => {
      if (!groups[item.section]) groups[item.section] = [];
      groups[item.section].push(item);
    });
    return groups;
  }, [filteredPassbook]);

  const codRatio = Math.min(100, Math.round((currentCash / maxCodLimit) * 100));
  const isHighRisk = codRatio >= 85;
  const isModerateRisk = codRatio >= 50 && codRatio < 85;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={() => {
        if (currentStep !== 'PROCESSING') onClose();
      }}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 38) }]}>
        <RNStatusBar barStyle="light-content" backgroundColor="#047857" />

        {/* ================= 1. CLEAN MODERN UPI HEADER ================= */}
        <View style={tw`bg-[#047857] px-4 py-3 border-b border-emerald-700/60`}>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (currentStep !== 'CONFIG' && currentStep !== 'PROCESSING' && currentStep !== 'SUCCESS') {
                    setCurrentStep('CONFIG');
                  } else {
                    onClose();
                  }
                }}
                style={tw`w-9 h-9 rounded-full bg-emerald-800/80 border border-emerald-600/70 items-center justify-center mr-3`}
              >
                <Ionicons
                  name={currentStep === 'CONFIG' || currentStep === 'SUCCESS' ? 'close' : 'arrow-back'}
                  size={19}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <View>
                <Text style={[Typography.cardTitle, { color: '#FFFFFF', fontSize: 16, fontWeight: '900' }]}>
                  {currentStep === 'SUCCESS'
                    ? 'Payment Receipt'
                    : currentStep === 'PROCESSING'
                    ? 'Processing Payment'
                    : activeTab === 'passbook'
                    ? 'Transaction History'
                    : 'COD Cash Deposit'}
                </Text>
                <Text style={[Typography.caption, { color: '#A7F3D0', fontSize: 11 }]}>
                  Dark Store Hub #04 • Koramangala
                </Text>
              </View>
            </View>

            {/* Top Help Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => showToast('All COD payments clear instantly via NPCI UPI')}
              style={tw`flex-row items-center bg-emerald-800/80 px-2.5 py-1.5 rounded-full border border-emerald-600/70`}
            >
              <Ionicons name="help-circle-outline" size={14} color="#D1FAE5" style={tw`mr-1`} />
              <Text style={[Typography.caption, { color: '#D1FAE5', fontWeight: '800', fontSize: 11 }]}>
                Help
              </Text>
            </TouchableOpacity>
          </View>

          {/* Clean Segmented Tabs */}
          {(currentStep === 'CONFIG' || activeTab === 'passbook') && currentStep !== 'SUCCESS' && (
            <View style={tw`flex-row bg-emerald-950/40 p-1 rounded-2xl mt-3 border border-emerald-700/50`}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setActiveTab('deposit');
                  setCurrentStep('CONFIG');
                }}
                style={[
                  tw`flex-1 py-2 rounded-xl flex-row items-center justify-center`,
                  { backgroundColor: activeTab === 'deposit' ? '#047857' : 'transparent' },
                ]}
              >
                <Ionicons
                  name="wallet"
                  size={14}
                  color={activeTab === 'deposit' ? '#FFFFFF' : '#A7F3D0'}
                  style={tw`mr-1.5`}
                />
                <Text
                  style={[
                    Typography.buttonText,
                    {
                      color: activeTab === 'deposit' ? '#FFFFFF' : '#A7F3D0',
                      fontSize: 12,
                      fontWeight: activeTab === 'deposit' ? '900' : '600',
                    },
                  ]}
                >
                  Deposit Cash
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setActiveTab('passbook')}
                style={[
                  tw`flex-1 py-2 rounded-xl flex-row items-center justify-center`,
                  { backgroundColor: activeTab === 'passbook' ? '#047857' : 'transparent' },
                ]}
              >
                <Ionicons
                  name="list"
                  size={14}
                  color={activeTab === 'passbook' ? '#FFFFFF' : '#A7F3D0'}
                  style={tw`mr-1.5`}
                />
                <Text
                  style={[
                    Typography.buttonText,
                    {
                      color: activeTab === 'passbook' ? '#FFFFFF' : '#A7F3D0',
                      fontSize: 12,
                      fontWeight: activeTab === 'passbook' ? '900' : '600',
                    },
                  ]}
                >
                  History & Passbook
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ================= 2. BODY CONTENT ================= */}

        {/* ================= TAB 1: PASSBOOK (TRUE UPI APP TRANSACTION LEDGER, NO CARDS) ================= */}
        {activeTab === 'passbook' ? (
          <View style={tw`flex-1 bg-white`}>
            {/* Filter Sub-Bar */}
            <View style={tw`flex-row items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200`}>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 11, fontWeight: '700' }]}>
                FILTER STATEMENT
              </Text>
              <View style={tw`flex-row items-center gap-1.5`}>
                {(['ALL', 'DEPOSIT', 'COLLECTION'] as const).map((filterKey) => (
                  <TouchableOpacity
                    key={filterKey}
                    onPress={() => setPassbookFilter(filterKey)}
                    style={[
                      tw`px-2.5 py-1 rounded-full border`,
                      {
                        backgroundColor: passbookFilter === filterKey ? '#047857' : '#FFFFFF',
                        borderColor: passbookFilter === filterKey ? '#047857' : '#CBD5E1',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        Typography.caption,
                        {
                          color: passbookFilter === filterKey ? '#FFFFFF' : '#475569',
                          fontWeight: '800',
                          fontSize: 10,
                        },
                      ]}
                    >
                      {filterKey === 'ALL' ? 'All' : filterKey === 'DEPOSIT' ? 'Deposits' : 'COD Received'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Flat Continuous UPI Statement List */}
            <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
              {Object.keys(groupedSections).length === 0 ? (
                <View style={tw`py-16 items-center justify-center p-6`}>
                  <Ionicons name="receipt-outline" size={42} color="#CBD5E1" />
                  <Text style={[Typography.bodyBold, { color: '#64748B', marginTop: 8 }]}>
                    No transactions found
                  </Text>
                </View>
              ) : (
                Object.entries(groupedSections).map(([sectionTitle, items]) => (
                  <View key={sectionTitle}>
                    {/* UPI Date Header Divider */}
                    <View style={tw`bg-slate-100/90 px-4 py-1.5 border-b border-slate-200`}>
                      <Text style={[Typography.caption, { color: '#64748B', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3 }]}>
                        {sectionTitle.toUpperCase()}
                      </Text>
                    </View>

                    {/* Transaction List Items (Flat Continuous UPI App Style) */}
                    {items.map((txn, index) => {
                      const isLast = index === items.length - 1;
                      return (
                        <TouchableOpacity
                          key={txn.id}
                          activeOpacity={0.7}
                          onPress={() => setSelectedTxn(txn)}
                          style={tw`px-4 py-3.5 bg-white flex-row items-center justify-between active:bg-slate-50`}
                        >
                          {/* Left: Avatar with App Logo / Method Icon */}
                          <View style={tw`flex-row items-center flex-1 pr-3`}>
                            <View
                              style={[
                                tw`w-11 h-11 rounded-full items-center justify-center mr-3 border`,
                                {
                                  backgroundColor:
                                    txn.appType === 'GPAY'
                                      ? '#EFF6FF'
                                      : txn.appType === 'PHONEPE'
                                      ? '#F3E8FF'
                                      : txn.appType === 'PAYTM'
                                      ? '#E0F2FE'
                                      : txn.appType === 'CRED'
                                      ? '#F1F5F9'
                                      : txn.appType === 'STORE'
                                      ? '#FEF3C7'
                                      : '#ECFDF5',
                                  borderColor:
                                    txn.appType === 'GPAY'
                                      ? '#BFDBFE'
                                      : txn.appType === 'PHONEPE'
                                      ? '#DDD6FE'
                                      : txn.appType === 'PAYTM'
                                      ? '#BAE6FD'
                                      : txn.appType === 'CRED'
                                      ? '#CBD5E1'
                                      : txn.appType === 'STORE'
                                      ? '#FDE68A'
                                      : '#A7F3D0',
                                },
                              ]}
                            >
                              {txn.appType === 'GPAY' ? (
                                <Ionicons name="logo-google" size={18} color="#1D4ED8" />
                              ) : txn.appType === 'PHONEPE' ? (
                                <Ionicons name="flash" size={18} color="#7C3AED" />
                              ) : txn.appType === 'PAYTM' ? (
                                <Ionicons name="wallet" size={18} color="#0284C7" />
                              ) : txn.appType === 'CRED' ? (
                                <Ionicons name="shield-checkmark" size={18} color="#0F172A" />
                              ) : txn.appType === 'STORE' ? (
                                <Ionicons name="storefront" size={18} color="#D97706" />
                              ) : (
                                <Ionicons name="business" size={18} color="#047857" />
                              )}
                            </View>

                            {/* Details */}
                            <View style={tw`flex-1`}>
                              <Text
                                numberOfLines={1}
                                style={[Typography.bodyBold, { color: '#0F172A', fontSize: 13, fontWeight: '800' }]}
                              >
                                {txn.title}
                              </Text>
                              <Text
                                numberOfLines={1}
                                style={[Typography.caption, { color: '#64748B', fontSize: 11, marginTop: 1 }]}
                              >
                                {txn.bankInfo}
                              </Text>
                              <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, marginTop: 1 }]}>
                                {txn.dateStr} • {txn.timeStr}
                              </Text>
                            </View>
                          </View>

                          {/* Right: Amount & Status */}
                          <View style={tw`items-end`}>
                            <Text
                              style={[
                                Typography.amountLarge,
                                {
                                  fontSize: 15,
                                  fontWeight: '900',
                                  color: txn.type === 'COLLECTION' ? '#047857' : '#0F172A',
                                },
                              ]}
                            >
                              {txn.type === 'COLLECTION' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                            </Text>

                            <View style={tw`flex-row items-center mt-1`}>
                              <Ionicons name="checkmark-circle" size={11} color="#047857" style={tw`mr-1`} />
                              <Text style={[Typography.caption, { color: '#047857', fontSize: 10, fontWeight: '700' }]}>
                                {txn.status === 'SUCCESS' ? 'Successful' : 'Settled'}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        ) : null}

        {/* ================= TAB 2: DEPOSIT FLOW (UPI NATIVE CHECKOUT) ================= */}
        {activeTab === 'deposit' && (
          <ScrollView
            style={tw`flex-1 bg-slate-50`}
            contentContainerStyle={[tw`p-4 pb-28`]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ================= STEP 1: CONFIG & METHOD SELECTION ================= */}
            {currentStep === 'CONFIG' && (
              <View style={tw`gap-4`}>
                {/* Clean Floating Cash Balance Bar */}
                <View style={tw`bg-white p-4 rounded-3xl border border-slate-200 shadow-sm`}>
                  <View style={tw`flex-row justify-between items-start`}>
                    <View>
                      <Text style={[Typography.caption, { color: '#64748B', fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5 }]}>
                        CURRENT FLOATING COD IN HAND
                      </Text>
                      <Text style={[Typography.amountLarge, { color: isHighRisk ? '#DC2626' : '#0F172A', fontSize: 28, fontWeight: '900', marginTop: 2 }]}>
                        ₹{currentCash.toLocaleString('en-IN')}.00
                      </Text>
                    </View>

                    <View
                      style={[
                        tw`px-2.5 py-1 rounded-full border`,
                        {
                          backgroundColor: isHighRisk ? '#FEE2E2' : isModerateRisk ? '#FEF3C7' : '#ECFDF5',
                          borderColor: isHighRisk ? '#F87171' : isModerateRisk ? '#FBBF24' : '#6EE7B7',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          Typography.badge,
                          {
                            color: isHighRisk ? '#B91C1C' : isModerateRisk ? '#B45309' : '#047857',
                            fontSize: 9.5,
                            fontWeight: '800',
                          },
                        ]}
                      >
                        {isHighRisk ? '⚠️ Limit Alert' : isModerateRisk ? '⚡ Moderate' : '✓ Safe Level'}
                      </Text>
                    </View>
                  </View>

                  {/* Limit Progress Bar */}
                  <View style={tw`mt-3 pt-3 border-t border-slate-100`}>
                    <View style={tw`flex-row justify-between items-center mb-1.5`}>
                      <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                        COD Capacity ({codRatio}%)
                      </Text>
                      <Text style={[Typography.caption, { color: '#0F172A', fontSize: 10, fontWeight: '700' }]}>
                        Max Holding Cap: ₹{maxCodLimit}
                      </Text>
                    </View>
                    <View style={tw`w-full h-2 rounded-full bg-slate-100 overflow-hidden`}>
                      <View
                        style={[
                          tw`h-full rounded-full`,
                          {
                            width: `${codRatio}%`,
                            backgroundColor: isHighRisk ? '#EF4444' : isModerateRisk ? '#F59E0B' : '#10B981',
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                {/* Amount Entry & Quick Chips */}
                <View style={tw`bg-white p-4 rounded-3xl border border-slate-200 shadow-sm gap-3`}>
                  <Text style={[Typography.sectionTitle, { color: '#0F172A', fontSize: 13 }]}>
                    Deposit Amount
                  </Text>

                  {/* Large UPI Numeric Box */}
                  <View
                    style={[
                      tw`flex-row items-center bg-slate-50 border-2 rounded-2xl px-4 py-3`,
                      { borderColor: amountError ? '#EF4444' : '#047857' },
                    ]}
                  >
                    <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 24, fontWeight: '900', marginRight: 4 }]}>
                      ₹
                    </Text>
                    <TextInput
                      value={depositAmount}
                      onChangeText={(val) => {
                        setDepositAmount(val);
                        setAmountError(null);
                      }}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor="#94A3B8"
                      style={tw`flex-1 text-slate-900 font-black text-xl p-0`}
                    />
                    {depositAmount.length > 0 && (
                      <TouchableOpacity onPress={() => setDepositAmount('')} style={tw`p-1`}>
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {amountError && (
                    <Text style={[Typography.caption, { color: '#DC2626', fontSize: 10.5 }]}>
                      {amountError}
                    </Text>
                  )}

                  {/* Quick Preset Chips */}
                  <View style={tw`flex-row flex-wrap gap-2 mt-1`}>
                    {currentCash > 0 && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleSelectPreset(currentCash)}
                        style={[
                          tw`px-3 py-2 rounded-xl border flex-row items-center`,
                          {
                            backgroundColor: depositAmount === currentCash.toString() ? '#D1FAE5' : '#F8FAFC',
                            borderColor: depositAmount === currentCash.toString() ? '#047857' : '#E2E8F0',
                          },
                        ]}
                      >
                        <Ionicons
                          name="sparkles"
                          size={12}
                          color={depositAmount === currentCash.toString() ? '#047857' : '#64748B'}
                          style={tw`mr-1`}
                        />
                        <Text
                          style={[
                            Typography.caption,
                            {
                              color: depositAmount === currentCash.toString() ? '#047857' : '#0F172A',
                              fontWeight: '800',
                              fontSize: 11,
                            },
                          ]}
                        >
                          Clear Full (₹{currentCash})
                        </Text>
                      </TouchableOpacity>
                    )}

                    {[1000, 500, 200].map((amt) => (
                      <TouchableOpacity
                        key={amt}
                        activeOpacity={0.8}
                        onPress={() => handleSelectPreset(amt)}
                        style={[
                          tw`px-3 py-2 rounded-xl border`,
                          {
                            backgroundColor: depositAmount === amt.toString() ? '#D1FAE5' : '#F8FAFC',
                            borderColor: depositAmount === amt.toString() ? '#047857' : '#E2E8F0',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            Typography.caption,
                            {
                              color: depositAmount === amt.toString() ? '#047857' : '#0F172A',
                              fontWeight: '800',
                              fontSize: 11,
                            },
                          ]}
                        >
                          ₹{amt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* UPI Payment Channel Selector (PhonePe/GPay style) */}
                <View style={tw`bg-white p-4 rounded-3xl border border-slate-200 shadow-sm gap-2.5`}>
                  <Text style={[Typography.sectionTitle, { color: '#0F172A', fontSize: 13, marginBottom: 2 }]}>
                    Select Clearance Mode
                  </Text>

                  {/* 1. UPI Apps */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setSelectedMethod('UPI')}
                    style={[
                      tw`p-3.5 rounded-2xl border flex-row items-center justify-between`,
                      {
                        backgroundColor: selectedMethod === 'UPI' ? '#ECFDF5' : '#FFFFFF',
                        borderColor: selectedMethod === 'UPI' ? '#047857' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={tw`flex-row items-center flex-1 pr-2`}>
                      <View style={tw`w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 items-center justify-center mr-3`}>
                        <Ionicons name="phone-portrait" size={18} color="#047857" />
                      </View>
                      <View style={tw`flex-1`}>
                        <View style={tw`flex-row items-center`}>
                          <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13, fontWeight: '800' }]}>
                            UPI Applications
                          </Text>
                          <View style={tw`ml-2 px-1.5 py-0.2 rounded bg-emerald-100 border border-emerald-300`}>
                            <Text style={[Typography.badge, { color: '#047857', fontSize: 8 }]}>
                              ⚡ Instant 2s
                            </Text>
                          </View>
                        </View>
                        <Text style={[Typography.caption, { color: '#64748B', fontSize: 10.5, marginTop: 1 }]}>
                          Google Pay, PhonePe, Paytm, CRED
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        tw`w-5 h-5 rounded-full border-2 items-center justify-center`,
                        {
                          borderColor: selectedMethod === 'UPI' ? '#047857' : '#CBD5E1',
                          backgroundColor: selectedMethod === 'UPI' ? '#047857' : 'transparent',
                        },
                      ]}
                    >
                      {selectedMethod === 'UPI' && <View style={tw`w-2 h-2 rounded-full bg-white`} />}
                    </View>
                  </TouchableOpacity>

                  {/* 2. QR Code */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setSelectedMethod('QR')}
                    style={[
                      tw`p-3.5 rounded-2xl border flex-row items-center justify-between`,
                      {
                        backgroundColor: selectedMethod === 'QR' ? '#ECFDF5' : '#FFFFFF',
                        borderColor: selectedMethod === 'QR' ? '#047857' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={tw`flex-row items-center flex-1 pr-2`}>
                      <View style={tw`w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 items-center justify-center mr-3`}>
                        <Ionicons name="qr-code" size={18} color="#2563EB" />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13, fontWeight: '800' }]}>
                          Dynamic UPI QR Code
                        </Text>
                        <Text style={[Typography.caption, { color: '#64748B', fontSize: 10.5, marginTop: 1 }]}>
                          Scan & pay with any UPI scanner
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        tw`w-5 h-5 rounded-full border-2 items-center justify-center`,
                        {
                          borderColor: selectedMethod === 'QR' ? '#047857' : '#CBD5E1',
                          backgroundColor: selectedMethod === 'QR' ? '#047857' : 'transparent',
                        },
                      ]}
                    >
                      {selectedMethod === 'QR' && <View style={tw`w-2 h-2 rounded-full bg-white`} />}
                    </View>
                  </TouchableOpacity>

                  {/* 3. Dark Store Counter */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setSelectedMethod('STORE')}
                    style={[
                      tw`p-3.5 rounded-2xl border flex-row items-center justify-between`,
                      {
                        backgroundColor: selectedMethod === 'STORE' ? '#ECFDF5' : '#FFFFFF',
                        borderColor: selectedMethod === 'STORE' ? '#047857' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={tw`flex-row items-center flex-1 pr-2`}>
                      <View style={tw`w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 items-center justify-center mr-3`}>
                        <Ionicons name="storefront" size={18} color="#D97706" />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13, fontWeight: '800' }]}>
                          Dark Store Cash Counter
                        </Text>
                        <Text style={[Typography.caption, { color: '#64748B', fontSize: 10.5, marginTop: 1 }]}>
                          Hand cash to Shift Manager at Hub #04
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        tw`w-5 h-5 rounded-full border-2 items-center justify-center`,
                        {
                          borderColor: selectedMethod === 'STORE' ? '#047857' : '#CBD5E1',
                          backgroundColor: selectedMethod === 'STORE' ? '#047857' : 'transparent',
                        },
                      ]}
                    >
                      {selectedMethod === 'STORE' && <View style={tw`w-2 h-2 rounded-full bg-white`} />}
                    </View>
                  </TouchableOpacity>

                  {/* 4. Virtual IMPS */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setSelectedMethod('IMPS')}
                    style={[
                      tw`p-3.5 rounded-2xl border flex-row items-center justify-between`,
                      {
                        backgroundColor: selectedMethod === 'IMPS' ? '#ECFDF5' : '#FFFFFF',
                        borderColor: selectedMethod === 'IMPS' ? '#047857' : '#E2E8F0',
                      },
                    ]}
                  >
                    <View style={tw`flex-row items-center flex-1 pr-2`}>
                      <View style={tw`w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 items-center justify-center mr-3`}>
                        <Ionicons name="business" size={18} color="#7C3AED" />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13, fontWeight: '800' }]}>
                          Virtual Account IMPS / NEFT
                        </Text>
                        <Text style={[Typography.caption, { color: '#64748B', fontSize: 10.5, marginTop: 1 }]}>
                          Direct bank transfer to ledger account
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        tw`w-5 h-5 rounded-full border-2 items-center justify-center`,
                        {
                          borderColor: selectedMethod === 'IMPS' ? '#047857' : '#CBD5E1',
                          backgroundColor: selectedMethod === 'IMPS' ? '#047857' : 'transparent',
                        },
                      ]}
                    >
                      {selectedMethod === 'IMPS' && <View style={tw`w-2 h-2 rounded-full bg-white`} />}
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Bottom Main CTA */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleProceed}
                  style={tw`w-full py-4 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-lg mt-1`}
                >
                  <Ionicons name="shield-checkmark" size={17} color="#FFFFFF" style={tw`mr-2`} />
                  <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 14, fontWeight: '900' }]}>
                    PROCEED TO PAY ₹{depositAmount || '0'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 2A: UPI APP CHOOSER ================= */}
            {currentStep === 'UPI_APPS' && (
              <View style={tw`gap-4`}>
                <View style={tw`bg-white p-4 rounded-3xl border border-slate-200 shadow-sm gap-3`}>
                  <View style={tw`flex-row justify-between items-center pb-2 border-b border-slate-100`}>
                    <Text style={[Typography.sectionTitle, { color: '#0F172A', fontSize: 13 }]}>
                      Select Installed UPI App
                    </Text>
                    <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 17, fontWeight: '900' }]}>
                      ₹{depositAmount}
                    </Text>
                  </View>

                  {[
                    { id: 'GPAY' as const, name: 'Google Pay', icon: 'logo-google', color: '#1A73E8', subtitle: 'Fast UPI 2.0 clearance' },
                    { id: 'PHONEPE' as const, name: 'PhonePe', icon: 'flash', color: '#5F259F', subtitle: 'Direct bank account link' },
                    { id: 'PAYTM' as const, name: 'Paytm UPI', icon: 'wallet', color: '#00BAF2', subtitle: 'Paytm Payments Bank' },
                    { id: 'CRED' as const, name: 'CRED UPI', icon: 'shield-checkmark', color: '#111827', subtitle: 'UPI with auto-reward' },
                  ].map((app) => (
                    <TouchableOpacity
                      key={app.id}
                      activeOpacity={0.85}
                      onPress={() => setSelectedUpiApp(app.id)}
                      style={[
                        tw`p-3.5 rounded-2xl border flex-row items-center justify-between`,
                        {
                          backgroundColor: selectedUpiApp === app.id ? '#ECFDF5' : '#F8FAFC',
                          borderColor: selectedUpiApp === app.id ? '#047857' : '#E2E8F0',
                        },
                      ]}
                    >
                      <View style={tw`flex-row items-center`}>
                        <View style={[tw`w-10 h-10 rounded-2xl items-center justify-center mr-3`, { backgroundColor: app.color }]}>
                          <Ionicons name={app.icon as any} size={18} color="#FFFFFF" />
                        </View>
                        <View>
                          <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13, fontWeight: '800' }]}>
                            {app.name}
                          </Text>
                          <Text style={[Typography.caption, { color: '#64748B', fontSize: 10.5 }]}>
                            {app.subtitle}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          tw`w-5 h-5 rounded-full border-2 items-center justify-center`,
                          {
                            borderColor: selectedUpiApp === app.id ? '#047857' : '#CBD5E1',
                            backgroundColor: selectedUpiApp === app.id ? '#047857' : 'transparent',
                          },
                        ]}
                      >
                        {selectedUpiApp === app.id && <View style={tw`w-2 h-2 rounded-full bg-white`} />}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => startProcessingSimulation(`UPI (${selectedUpiApp})`, selectedUpiApp)}
                  style={tw`w-full py-4 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-lg`}
                >
                  <Ionicons name="card" size={17} color="#FFFFFF" style={tw`mr-2`} />
                  <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 14, fontWeight: '900' }]}>
                    PAY VIA {selectedUpiApp} (₹{depositAmount})
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 2B: DYNAMIC QR CODE ================= */}
            {currentStep === 'QR_CODE' && (
              <View style={tw`gap-4 items-center`}>
                <View style={tw`bg-white p-5 rounded-3xl border border-slate-200 shadow-sm w-full items-center`}>
                  <View style={tw`flex-row items-center justify-between w-full pb-3 border-b border-slate-100`}>
                    <View>
                      <Text style={[Typography.caption, { color: '#64748B', fontSize: 10.5, fontWeight: '700' }]}>
                        SCAN WITH ANY UPI APP
                      </Text>
                      <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 22, fontWeight: '900' }]}>
                        ₹{depositAmount}.00
                      </Text>
                    </View>

                    <View style={tw`flex-row items-center bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200`}>
                      <Ionicons name="time-outline" size={13} color="#B45309" style={tw`mr-1`} />
                      <Text style={[Typography.badge, { color: '#B45309', fontSize: 11 }]}>
                        {formatSeconds(qrSecondsLeft)}
                      </Text>
                    </View>
                  </View>

                  {/* QR SVG Graphic */}
                  <View style={tw`my-4 p-4 rounded-3xl bg-white border-2 border-slate-900 shadow-md items-center justify-center`}>
                    <Svg width={175} height={175} viewBox="0 0 180 180">
                      <Rect x="10" y="10" width="50" height="50" rx="8" fill="#047857" />
                      <Rect x="20" y="20" width="30" height="30" rx="4" fill="#FFFFFF" />
                      <Rect x="27" y="27" width="16" height="16" rx="2" fill="#047857" />

                      <Rect x="120" y="10" width="50" height="50" rx="8" fill="#047857" />
                      <Rect x="130" y="20" width="30" height="30" rx="4" fill="#FFFFFF" />
                      <Rect x="137" y="27" width="16" height="16" rx="2" fill="#047857" />

                      <Rect x="10" y="120" width="50" height="50" rx="8" fill="#047857" />
                      <Rect x="20" y="130" width="30" height="30" rx="4" fill="#FFFFFF" />
                      <Rect x="27" y="137" width="16" height="16" rx="2" fill="#047857" />

                      <Rect x="70" y="15" width="12" height="12" rx="2" fill="#047857" />
                      <Rect x="90" y="15" width="18" height="12" rx="2" fill="#047857" />
                      <Rect x="70" y="35" width="38" height="12" rx="2" fill="#047857" />
                      <Rect x="15" y="70" width="14" height="35" rx="2" fill="#047857" />
                      <Rect x="38" y="70" width="22" height="14" rx="2" fill="#047857" />
                      <Rect x="38" y="92" width="22" height="14" rx="2" fill="#047857" />

                      <Circle cx="90" cy="90" r="22" fill="#FFFFFF" />
                      <Circle cx="90" cy="90" r="18" fill="#047857" />
                      <Path d="M84 90 L88 94 L96 86" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      <Rect x="70" y="120" width="38" height="12" rx="2" fill="#047857" />
                      <Rect x="120" y="70" width="16" height="38" rx="2" fill="#047857" />
                      <Rect x="144" y="70" width="26" height="16" rx="2" fill="#047857" />
                      <Rect x="144" y="94" width="26" height="16" rx="2" fill="#047857" />
                      <Rect x="120" y="120" width="20" height="20" rx="2" fill="#047857" />
                      <Rect x="150" y="120" width="20" height="40" rx="2" fill="#047857" />
                      <Rect x="70" y="140" width="14" height="20" rx="2" fill="#047857" />
                      <Rect x="92" y="140" width="16" height="20" rx="2" fill="#047857" />
                    </Svg>
                  </View>

                  {/* VPA ID */}
                  <View style={tw`flex-row items-center justify-between bg-slate-100 px-3.5 py-2.5 rounded-2xl w-full border border-slate-200`}>
                    <View>
                      <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
                        OFFICIAL VPA / UPI ID
                      </Text>
                      <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                        grocerymart.cod@icici
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => copyText('grocerymart.cod@icici', 'UPI ID')}
                      style={tw`px-3 py-1.5 rounded-xl bg-white border border-slate-300 shadow-sm flex-row items-center`}
                    >
                      <Ionicons name="copy-outline" size={12} color="#047857" style={tw`mr-1`} />
                      <Text style={[Typography.buttonText, { color: '#047857', fontSize: 10.5 }]}>
                        Copy
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => startProcessingSimulation('Dynamic UPI QR', 'GPAY')}
                  style={tw`w-full py-4 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-lg`}
                >
                  <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" style={tw`mr-2`} />
                  <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 13.5, fontWeight: '900' }]}>
                    SIMULATE PAYMENT VERIFIED (₹{depositAmount})
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 2C: DARK STORE COUNTER ================= */}
            {currentStep === 'STORE_COUNTER' && (
              <View style={tw`gap-4`}>
                <View style={tw`bg-white p-5 rounded-3xl border border-slate-200 shadow-sm gap-3`}>
                  <View style={tw`flex-row justify-between items-center pb-2 border-b border-slate-100`}>
                    <View>
                      <Text style={[Typography.caption, { color: '#D97706', fontSize: 10, fontWeight: '800' }]}>
                        CASH HANDOVER TOKEN
                      </Text>
                      <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 15, fontWeight: '900' }]}>
                        Koramangala Dark Store #04
                      </Text>
                    </View>
                    <View style={tw`px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200`}>
                      <Text style={[Typography.badge, { color: '#B45309', fontSize: 10 }]}>
                        Active Slip
                      </Text>
                    </View>
                  </View>

                  <View style={tw`p-4 rounded-2xl bg-slate-900 items-center my-1`}>
                    <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 11 }]}>
                      Exact Cash to Hand Over
                    </Text>
                    <Text style={[Typography.amountLarge, { color: '#10B981', fontSize: 30, fontWeight: '900', marginTop: 2 }]}>
                      ₹{depositAmount}.00
                    </Text>

                    <View style={tw`mt-3 pt-3 border-t border-slate-800 w-full items-center`}>
                      <Text style={[Typography.caption, { color: '#CBD5E1', fontSize: 10 }]}>
                        Share 4-Digit PIN with Store Shift Lead
                      </Text>
                      <Text style={[Typography.amountLarge, { color: '#FDE047', fontSize: 24, letterSpacing: 8, marginTop: 2 }]}>
                        8 3 9 2
                      </Text>
                    </View>
                  </View>

                  {/* Scannable Barcode */}
                  <View style={tw`bg-white p-3 rounded-2xl border border-slate-300 items-center`}>
                    <Svg width={240} height={45} viewBox="0 0 240 45">
                      <Rect x="10" y="5" width="4" height="35" fill="#0F172A" />
                      <Rect x="18" y="5" width="2" height="35" fill="#0F172A" />
                      <Rect x="24" y="5" width="6" height="35" fill="#0F172A" />
                      <Rect x="34" y="5" width="3" height="35" fill="#0F172A" />
                      <Rect x="42" y="5" width="5" height="35" fill="#0F172A" />
                      <Rect x="52" y="5" width="2" height="35" fill="#0F172A" />
                      <Rect x="58" y="5" width="7" height="35" fill="#0F172A" />
                      <Rect x="70" y="5" width="3" height="35" fill="#0F172A" />
                      <Rect x="78" y="5" width="5" height="35" fill="#0F172A" />
                      <Rect x="88" y="5" width="2" height="35" fill="#0F172A" />
                      <Rect x="96" y="5" width="6" height="35" fill="#0F172A" />
                      <Rect x="108" y="5" width="3" height="35" fill="#0F172A" />
                      <Rect x="116" y="5" width="7" height="35" fill="#0F172A" />
                      <Rect x="128" y="5" width="2" height="35" fill="#0F172A" />
                      <Rect x="136" y="5" width="5" height="35" fill="#0F172A" />
                      <Rect x="146" y="5" width="3" height="35" fill="#0F172A" />
                      <Rect x="154" y="5" width="6" height="35" fill="#0F172A" />
                      <Rect x="166" y="5" width="2" height="35" fill="#0F172A" />
                      <Rect x="174" y="5" width="5" height="35" fill="#0F172A" />
                      <Rect x="184" y="5" width="7" height="35" fill="#0F172A" />
                      <Rect x="196" y="5" width="2" height="35" fill="#0F172A" />
                      <Rect x="204" y="5" width="6" height="35" fill="#0F172A" />
                      <Rect x="216" y="5" width="4" height="35" fill="#0F172A" />
                    </Svg>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10, marginTop: 2, letterSpacing: 2 }]}>
                      #COD-HUB4-88492
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => startProcessingSimulation('Dark Store Counter #04', 'STORE')}
                  style={tw`w-full py-4 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-lg`}
                >
                  <Ionicons name="checkmark-done" size={17} color="#FFFFFF" style={tw`mr-2`} />
                  <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 13.5, fontWeight: '900' }]}>
                    SIMULATE CASHIER SCAN & CLEARANCE
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 2D: VIRTUAL IMPS ================= */}
            {currentStep === 'VIRTUAL_IMPS' && (
              <View style={tw`gap-4`}>
                <View style={tw`bg-white p-5 rounded-3xl border border-slate-200 shadow-sm gap-3`}>
                  <View style={tw`flex-row justify-between items-center pb-2 border-b border-slate-100`}>
                    <Text style={[Typography.sectionTitle, { color: '#0F172A', fontSize: 13 }]}>
                      Partner Settlement Virtual Account
                    </Text>
                    <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 16, fontWeight: '900' }]}>
                      ₹{depositAmount}
                    </Text>
                  </View>

                  {[
                    { label: 'Beneficiary Name', value: 'GroceryMart Partner Settlement Pvt Ltd' },
                    { label: 'Virtual Account No.', value: 'GPMART9876543210' },
                    { label: 'IFSC Code', value: 'ICIC0000001' },
                    { label: 'Bank Name', value: 'ICICI Bank • Corporate Branch' },
                  ].map((row, idx) => (
                    <View
                      key={idx}
                      style={tw`flex-row justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-200`}
                    >
                      <View style={tw`flex-1 pr-2`}>
                        <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
                          {row.label}
                        </Text>
                        <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12, marginTop: 1 }]}>
                          {row.value}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => copyText(row.value, row.label)}
                        style={tw`p-2 rounded-xl bg-white border border-slate-300 shadow-sm`}
                      >
                        <Ionicons name="copy-outline" size={14} color="#047857" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => startProcessingSimulation('Virtual Account IMPS', 'IMPS')}
                  style={tw`w-full py-4 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-lg`}
                >
                  <Ionicons name="arrow-forward-circle" size={17} color="#FFFFFF" style={tw`mr-2`} />
                  <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 14, fontWeight: '900' }]}>
                    SIMULATE IMPS CLEARANCE (₹{depositAmount})
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 3: PROCESSING PIPELINE ================= */}
            {currentStep === 'PROCESSING' && (
              <View style={tw`bg-white p-6 rounded-3xl border border-slate-200 shadow-lg items-center my-6`}>
                <View style={tw`w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 items-center justify-center mb-4`}>
                  <ActivityIndicator size="large" color="#047857" />
                </View>

                <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 18, fontWeight: '900', textAlign: 'center' }]}>
                  Verifying UPI Settlement
                </Text>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 11, textAlign: 'center', marginTop: 4 }]}>
                  Communicating with NPCI settlement gateway...
                </Text>

                <View style={tw`w-full mt-6 gap-3`}>
                  <View style={tw`flex-row items-center`}>
                    <Ionicons
                      name={processingStage >= 1 ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={processingStage >= 1 ? '#047857' : '#94A3B8'}
                      style={tw`mr-2.5`}
                    />
                    <Text style={[Typography.bodyBold, { color: processingStage >= 1 ? '#0F172A' : '#94A3B8', fontSize: 12 }]}>
                      1. Connecting to Clearance Gateway
                    </Text>
                  </View>

                  <View style={tw`flex-row items-center`}>
                    <Ionicons
                      name={processingStage >= 2 ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={processingStage >= 2 ? '#047857' : '#94A3B8'}
                      style={tw`mr-2.5`}
                    />
                    <Text style={[Typography.bodyBold, { color: processingStage >= 2 ? '#0F172A' : '#94A3B8', fontSize: 12 }]}>
                      2. Authorizing Bank Settlement Token
                    </Text>
                  </View>

                  <View style={tw`flex-row items-center`}>
                    <Ionicons
                      name={processingStage >= 3 ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={processingStage >= 3 ? '#047857' : '#94A3B8'}
                      style={tw`mr-2.5`}
                    />
                    <Text style={[Typography.bodyBold, { color: processingStage >= 3 ? '#0F172A' : '#94A3B8', fontSize: 12 }]}>
                      3. Reconciling Floating COD Ledger
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ================= STEP 4: SUCCESS RECEIPT ================= */}
            {currentStep === 'SUCCESS' && lastTxn && (
              <Animated.View
                style={[
                  tw`bg-white p-5 rounded-3xl border border-emerald-200 shadow-xl items-center gap-4`,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <View style={tw`w-20 h-20 rounded-full bg-emerald-500 border-4 border-emerald-100 items-center justify-center shadow-lg mt-2`}>
                  <Ionicons name="checkmark-done" size={38} color="#FFFFFF" />
                </View>

                <View style={tw`items-center`}>
                  <Text style={[Typography.cardTitle, { color: '#047857', fontSize: 20, fontWeight: '900' }]}>
                    Deposit Successful! 🎉
                  </Text>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 11, textAlign: 'center', marginTop: 2 }]}>
                    Paid to GroceryMart Logistics Pvt Ltd
                  </Text>
                </View>

                <View style={tw`w-full bg-emerald-50 p-4 rounded-2xl border border-emerald-200 items-center`}>
                  <Text style={[Typography.caption, { color: '#047857', fontSize: 10.5, fontWeight: '800' }]}>
                    AMOUNT CLEARED
                  </Text>
                  <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 32, fontWeight: '900', marginTop: 2 }]}>
                    ₹{lastTxn.amount.toLocaleString('en-IN')}.00
                  </Text>
                  <Text style={[Typography.caption, { color: '#047857', fontSize: 11, fontWeight: '700', marginTop: 4 }]}>
                    ✓ Remaining Cash in Hand: ₹{Math.max(0, currentCash - lastTxn.amount)}
                  </Text>
                </View>

                {/* Digital Receipt Breakdown */}
                <View style={tw`w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 gap-2`}>
                  <View style={tw`flex-row justify-between items-center pb-2 border-b border-slate-200`}>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10.5 }]}>
                      UPI Ref / UTR
                    </Text>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11 }]}>
                      {lastTxn.utr}
                    </Text>
                  </View>

                  <View style={tw`flex-row justify-between items-center pb-2 border-b border-slate-200`}>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10.5 }]}>
                      Payment Method
                    </Text>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11 }]}>
                      {lastTxn.method}
                    </Text>
                  </View>

                  <View style={tw`flex-row justify-between items-center pb-2 border-b border-slate-200`}>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10.5 }]}>
                      Timestamp
                    </Text>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11 }]}>
                      {lastTxn.dateStr} • {lastTxn.timeStr}
                    </Text>
                  </View>

                  <View style={tw`flex-row justify-between items-center`}>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10.5 }]}>
                      Settlement Status
                    </Text>
                    <Text style={[Typography.bodyBold, { color: '#047857', fontSize: 11 }]}>
                      ✓ Paid & Reconciled
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={tw`w-full gap-2 mt-1`}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleShareReceipt(lastTxn)}
                    style={tw`w-full py-3.5 rounded-2xl bg-white border border-slate-300 items-center justify-center flex-row shadow-sm`}
                  >
                    <Ionicons name="share-social-outline" size={16} color="#0F172A" style={tw`mr-2`} />
                    <Text style={[Typography.buttonText, { color: '#0F172A', fontSize: 12, fontWeight: '800' }]}>
                      SHARE RECEIPT
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={onClose}
                    style={tw`w-full py-4 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-lg`}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={tw`mr-2`} />
                    <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 14, fontWeight: '900' }]}>
                      DONE & RETURN TO DASHBOARD
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        )}

        {/* ================= 3. UPI TRANSACTION DETAILS MODAL (WHEN ITEM CLICKED IN PASSBOOK) ================= */}
        <Modal
          visible={!!selectedTxn}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedTxn(null)}
        >
          <View style={[tw`flex-1 justify-end`, { backgroundColor: 'rgba(15, 23, 42, 0.65)' }]}>
            <View style={tw`bg-white rounded-t-3xl p-5 pb-8 max-h-[85%]`}>
              {/* Grabber */}
              <View style={tw`w-12 h-1 bg-slate-300 rounded-full self-center mb-4`} />

              {selectedTxn && (
                <View style={tw`gap-4`}>
                  {/* Top Status Header */}
                  <View style={tw`items-center pb-3 border-b border-slate-100`}>
                    <View style={tw`w-14 h-14 rounded-full bg-emerald-100 items-center justify-center mb-2`}>
                      <Ionicons name="checkmark-circle" size={32} color="#047857" />
                    </View>
                    <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 17, fontWeight: '900' }]}>
                      Payment to {selectedTxn.title}
                    </Text>
                    <Text style={[Typography.caption, { color: '#047857', fontSize: 12, fontWeight: '800', marginTop: 1 }]}>
                      Successful
                    </Text>
                    <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 30, fontWeight: '900', marginTop: 4 }]}>
                      ₹{selectedTxn.amount.toLocaleString('en-IN')}.00
                    </Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 11, marginTop: 1 }]}>
                      {selectedTxn.dateStr} at {selectedTxn.timeStr}
                    </Text>
                  </View>

                  {/* Transaction Details Ledger Box */}
                  <View style={tw`bg-slate-50 p-4 rounded-2xl border border-slate-200 gap-2.5`}>
                    <View style={tw`flex-row justify-between items-center pb-2 border-b border-slate-200`}>
                      <Text style={[Typography.caption, { color: '#64748B', fontSize: 11 }]}>
                        UPI Transaction ID
                      </Text>
                      <View style={tw`flex-row items-center`}>
                        <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11, marginRight: 6 }]}>
                          {selectedTxn.id}
                        </Text>
                        <TouchableOpacity onPress={() => copyText(selectedTxn.id, 'Transaction ID')}>
                          <Ionicons name="copy-outline" size={13} color="#047857" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={tw`flex-row justify-between items-center pb-2 border-b border-slate-200`}>
                      <Text style={[Typography.caption, { color: '#64748B', fontSize: 11 }]}>
                        Bank Reference (UTR)
                      </Text>
                      <View style={tw`flex-row items-center`}>
                        <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11, marginRight: 6 }]}>
                          {selectedTxn.utr}
                        </Text>
                        <TouchableOpacity onPress={() => copyText(selectedTxn.utr, 'UTR')}>
                          <Ionicons name="copy-outline" size={13} color="#047857" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={tw`flex-row justify-between items-center pb-2 border-b border-slate-200`}>
                      <Text style={[Typography.caption, { color: '#64748B', fontSize: 11 }]}>
                        Paid From / Mode
                      </Text>
                      <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11 }]}>
                        {selectedTxn.bankInfo}
                      </Text>
                    </View>

                    <View style={tw`flex-row justify-between items-center`}>
                      <Text style={[Typography.caption, { color: '#64748B', fontSize: 11 }]}>
                        To Payee VPA
                      </Text>
                      <Text style={[Typography.bodyBold, { color: '#047857', fontSize: 11 }]}>
                        {selectedTxn.payee}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={tw`flex-row gap-2 mt-2`}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleShareReceipt(selectedTxn)}
                      style={tw`flex-1 py-3 rounded-xl bg-slate-100 border border-slate-300 items-center justify-center flex-row`}
                    >
                      <Ionicons name="share-social-outline" size={15} color="#0F172A" style={tw`mr-1.5`} />
                      <Text style={[Typography.buttonText, { color: '#0F172A', fontSize: 11, fontWeight: '800' }]}>
                        Share Receipt
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={() => setSelectedTxn(null)}
                      style={tw`flex-1 py-3 rounded-xl bg-emerald-600 border border-emerald-500 items-center justify-center`}
                    >
                      <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 11, fontWeight: '800' }]}>
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* ================= 4. FLOATING TOAST ================= */}
        {toastMessage && (
          <Animated.View
            style={[
              tw`absolute bottom-8 self-center bg-slate-900/95 px-4 py-2.5 rounded-2xl flex-row items-center border border-slate-700 shadow-2xl`,
              { opacity: toastOpacity },
            ]}
          >
            <Ionicons name="checkmark-circle" size={15} color="#10B981" style={tw`mr-2`} />
            <Text style={[Typography.caption, { color: '#FFFFFF', fontSize: 11, fontWeight: '700' }]}>
              {toastMessage}
            </Text>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#047857',
  },
});
