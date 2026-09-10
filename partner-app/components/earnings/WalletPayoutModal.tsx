import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useAuthContext } from '../../context/AuthContext';

interface WalletPayoutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WalletPayoutModal: React.FC<WalletPayoutModalProps> = ({ visible, onClose }) => {
  const { earningsSummary, earningsData, withdrawEarnings } = useDeliveryContext();
  const { deliveryPartner, user } = useAuthContext();

  const [amount, setAmount] = useState('500');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Extract bank details from backend
  const holderName =
    earningsData?.bankDetails?.holderName ||
    deliveryPartner?.bankHolderName ||
    user?.name ||
    '';
  const maskedAccount =
    earningsData?.bankDetails?.maskedAccountNumber ||
    (deliveryPartner?.bankAccountNumber
      ? `••••${deliveryPartner.bankAccountNumber.slice(-4)}`
      : '');
  const ifsc =
    earningsData?.bankDetails?.ifsc ||
    deliveryPartner?.bankIfsc ||
    '';
  const isBankLinked = Boolean(maskedAccount && ifsc);

  const walletBalance = earningsData?.walletBalance ?? earningsSummary.walletBalance ?? 0;

  const handleWithdraw = async () => {
    if (!isBankLinked) {
      setErrorMsg('Please link and verify your Bank Account in Profile KYC before withdrawing.');
      return;
    }

    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setErrorMsg('Please enter a valid withdrawal amount');
      return;
    }
    if (num > walletBalance) {
      setErrorMsg(`Amount exceeds available balance (₹${walletBalance.toFixed(2)})`);
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await withdrawEarnings(num);
      if (res.success) {
        setSuccessMsg(res.message || `Successfully transferred ₹${num} to your account!`);
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.message || 'Withdrawal failed. Please check balance and try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while processing withdrawal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.overlay,
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: Colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 20,
            paddingBottom: 36,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>
                Withdraw to Bank
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                Instant payout via IMPS • 24x7 Direct Bank Credit
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <Ionicons name="close-circle" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Account info card */}
          {isBankLinked ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.surfaceCard,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: Colors.border,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: '#ECFDF5',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="business" size={20} color="#047857" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '800', color: Colors.text }}>
                  {holderName || 'Registered Bank Account'}
                </Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 1 }}>
                  A/C: {maskedAccount} • IFSC: {ifsc}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <Ionicons name="checkmark-circle" size={14} color="#047857" style={{ marginRight: 3 }} />
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#047857' }}>Verified</Text>
              </View>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: '#FEF2F2',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#FEE2E2',
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="alert-circle" size={22} color="#DC2626" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#991B1B' }}>
                  Bank Details Not Linked
                </Text>
                <Text style={{ fontSize: 10.5, color: '#B91C1C', marginTop: 1 }}>
                  Please complete Bank Details KYC in your Profile tab to enable instant withdrawals.
                </Text>
              </View>
            </View>
          )}

          {/* Amount input */}
          <View
            style={{
              backgroundColor: Colors.surfaceCard,
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: Colors.border,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, fontWeight: '600' }}>
                Enter Withdrawal Amount
              </Text>
              <Text style={{ fontSize: 12, color: '#047857', fontWeight: '800' }}>
                Balance: ₹{walletBalance.toFixed(2)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: 10, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.text, marginRight: 4 }}>
                ₹
              </Text>
              <TextInput
                value={amount}
                onChangeText={(txt) => {
                  setAmount(txt);
                  setErrorMsg('');
                }}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                editable={!isSubmitting}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  fontSize: 22,
                  fontWeight: '800',
                  color: Colors.text,
                }}
              />
            </View>

            {/* Quick chips */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {['200', '500', '1000', 'All'].map((chip) => {
                const chipValue = chip === 'All' ? Math.floor(walletBalance).toString() : chip;
                return (
                  <TouchableOpacity
                    key={chip}
                    disabled={isSubmitting}
                    onPress={() => {
                      setAmount(chipValue);
                      setErrorMsg('');
                    }}
                    style={{
                      backgroundColor: Colors.surfaceLight,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: Colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primaryDark }}>
                      {chip === 'All' ? 'Transfer All' : `₹${chip}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {errorMsg ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Ionicons name="warning-outline" size={14} color={Colors.danger} style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 12, color: Colors.danger, flex: 1 }}>{errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Ionicons name="checkmark-circle" size={14} color="#047857" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 12, color: '#047857', fontWeight: '700', flex: 1 }}>
                  {successMsg}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Action button */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isSubmitting || !isBankLinked || walletBalance <= 0}
            onPress={handleWithdraw}
            style={{
              backgroundColor: !isBankLinked || walletBalance <= 0 ? '#94A3B8' : '#047857',
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="flash" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            )}
            <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 }}>
              {!isBankLinked
                ? 'LINK BANK ACCOUNT FIRST'
                : walletBalance <= 0
                ? 'INSUFFICIENT BALANCE'
                : isSubmitting
                ? 'TRANSFERRING TO BANK...'
                : 'TRANSFER TO BANK NOW'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
