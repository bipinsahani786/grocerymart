import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryOrder } from '../../constants/mockData';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface DeliveryVerifyModalProps {
  visible: boolean;
  order: DeliveryOrder;
  onClose: () => void;
  onSuccess: (payout: number) => void;
}

export const DeliveryVerifyModal: React.FC<DeliveryVerifyModalProps> = ({
  visible,
  order,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { completeDelivery } = useDeliveryContext();
  const [otp, setOtp] = useState('');
  const [cashCollectedCheck, setCashCollectedCheck] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isCod = order.paymentMode === 'CASH_ON_DELIVERY';

  const handleVerify = () => {
    if (isCod && !cashCollectedCheck) {
      setErrorMsg('Please confirm you collected ₹' + order.totalAmount + ' in cash.');
      return;
    }

    const res = completeDelivery(otp);
    if (res.success) {
      setErrorMsg('');
      setOtp('');
      onClose();
      onSuccess(order.totalPayout);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleAutoFill = () => {
    setOtp(order.otp || '1234');
    if (isCod) setCashCollectedCheck(true);
    setErrorMsg('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[tw`flex-1 justify-end`, { backgroundColor: 'rgba(15, 23, 42, 0.65)' }]}>
        <View
          style={[
            tw`bg-white rounded-t-3xl border-t border-emerald-500 shadow-2xl p-4 max-h-[85%]`,
            { paddingBottom: Math.max(insets.bottom, 20) + 12 },
          ]}
        >
          {/* Drag Grabber */}
          <View style={tw`w-10 h-1 bg-slate-200 rounded-full self-center mb-3`} />

          {/* Header */}
          <View style={tw`flex-row justify-between items-center pb-3 border-b border-slate-100 mb-3`}>
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <View style={tw`w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 items-center justify-center mr-2.5`}>
                <Ionicons name="key-outline" size={15} color="#047857" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13 }]}>
                  Verify Doorstep Delivery
                </Text>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
                  Ask customer for 4-digit OTP • Order #{order.orderNumber}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={tw`w-7 h-7 rounded-full bg-slate-100 items-center justify-center`}>
              <Ionicons name="close" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* OTP Input Card */}
          <View style={tw`p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-3 items-center`}>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 10, fontWeight: '700', marginBottom: 6 }]}>
              ENTER CUSTOMER DOORSTEP OTP
            </Text>

            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <TextInput
                value={otp}
                onChangeText={(t) => {
                  setOtp(t);
                  setErrorMsg('');
                }}
                keyboardType="numeric"
                maxLength={4}
                placeholder="4-digit OTP"
                placeholderTextColor="#94A3B8"
                style={[
                  tw`px-4 py-2 rounded-xl bg-white border text-center font-black text-slate-900 tracking-widest`,
                  {
                    borderColor: otp ? '#10B981' : '#CBD5E1',
                    fontSize: otp ? 18 : 11,
                    minWidth: 160,
                  },
                ]}
              />

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleAutoFill}
                style={tw`px-2.5 py-2.5 rounded-xl bg-emerald-100 border border-emerald-300`}
              >
                <Text style={[Typography.badge, { color: '#047857', fontSize: 9 }]}>
                  Auto-Fill ({order.otp || '1234'})
                </Text>
              </TouchableOpacity>
            </View>

            {errorMsg ? (
              <Text style={[Typography.caption, { color: '#DC2626', fontSize: 10, fontWeight: '700', marginTop: 2 }]}>
                {errorMsg}
              </Text>
            ) : null}
          </View>

          {/* COD Checkbox if Cash on Delivery */}
          {isCod && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setCashCollectedCheck(!cashCollectedCheck)}
              style={[
                tw`p-3 rounded-2xl border flex-row items-center justify-between mb-3`,
                {
                  backgroundColor: cashCollectedCheck ? '#FEF3C7' : '#FFFFFF',
                  borderColor: cashCollectedCheck ? '#F59E0B' : '#E2E8F0',
                },
              ]}
            >
              <View style={tw`flex-row items-center flex-1 mr-2`}>
                <Ionicons
                  name={cashCollectedCheck ? 'checkbox' : 'square-outline'}
                  size={18}
                  color={cashCollectedCheck ? '#B45309' : '#94A3B8'}
                  style={tw`mr-2`}
                />
                <Text style={[Typography.bodyBold, { color: '#78350F', fontSize: 11 }]}>
                  I confirm collecting ₹{order.totalAmount} cash from customer
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View style={tw`flex-row gap-2.5`}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={tw`flex-1 py-3 rounded-2xl bg-slate-100 border border-slate-200 items-center justify-center`}
            >
              <Text style={[Typography.buttonText, { color: '#64748B', fontSize: 11.5 }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleVerify}
              style={tw`flex-2 py-3 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-md`}
            >
              <Ionicons name="checkmark-done-circle" size={16} color="#FFFFFF" style={tw`mr-1.5`} />
              <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 12, fontWeight: '900' }]}>
                VERIFY OTP & COMPLETE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
