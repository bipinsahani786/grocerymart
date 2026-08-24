import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useDeliveryContext } from '../../context/DeliveryContext';

interface WalletPayoutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WalletPayoutModal: React.FC<WalletPayoutModalProps> = ({ visible, onClose }) => {
  const { earningsSummary, withdrawEarnings } = useDeliveryContext();
  const [amount, setAmount] = useState('1000');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleWithdraw = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }
    if (num > earningsSummary.walletBalance) {
      setErrorMsg('Amount exceeds available wallet balance');
      return;
    }

    const ok = withdrawEarnings(num);
    if (ok) {
      setErrorMsg('');
      setSuccessMsg(`Successfully transferred ₹${num} to HDFC Bank ****4921!`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>
                Withdraw to Bank
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                Instant payout via IMPS to your registered account
              </Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Account info card */}
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
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: Colors.blueLight,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Ionicons name="business" size={18} color={Colors.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>
                HDFC Bank Primary
              </Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                A/C: *******4921 • IFSC: HDFC0001248
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
          </View>

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
            <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 8 }}>
              Enter Withdrawal Amount (₹)
            </Text>
            <TextInput
              value={amount}
              onChangeText={(txt) => {
                setAmount(txt);
                setErrorMsg('');
              }}
              placeholder="Amount"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              style={{
                backgroundColor: Colors.surfaceLight,
                borderRadius: 10,
                padding: 12,
                fontSize: 20,
                fontWeight: '800',
                color: Colors.text,
              }}
            />

            {/* Quick chips */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              {['500', '1000', '2000', 'All'].map((chip) => (
                <TouchableOpacity
                  key={chip}
                  onPress={() => setAmount(chip === 'All' ? earningsSummary.walletBalance.toString() : chip)}
                  style={{
                    backgroundColor: Colors.surfaceLight,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: Colors.border,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primaryDark }}>
                    {chip === 'All' ? 'Transfer All' : `₹${chip}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {errorMsg ? (
              <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 8 }}>{errorMsg}</Text>
            ) : null}

            {successMsg ? (
              <Text style={{ fontSize: 12, color: Colors.primary, marginTop: 8, fontWeight: '700' }}>
                {successMsg}
              </Text>
            ) : null}
          </View>

          {/* Action button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleWithdraw}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.white }}>
              TRANSFER TO BANK NOW
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
