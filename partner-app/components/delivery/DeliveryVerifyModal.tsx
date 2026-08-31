import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
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
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={[tw`flex-1 justify-end`, { backgroundColor: 'rgba(15, 23, 42, 0.68)' }]}>
        <View style={tw`bg-white rounded-t-3xl border-t border-emerald-500 shadow-2xl p-4 pb-8`}>
          {/* Top Grabber */}
          <View style={tw`w-10 h-1 rounded-full bg-slate-200 self-center mb-3`} />

          {/* Header */}
          <View style={tw`flex-row justify-between items-center pb-3 mb-3 border-b border-slate-100`}>
            <View>
              <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13 }]}>
                Doorstep Verification
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                Order #{order.orderNumber} • {order.customerName}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={tw`w-7 h-7 rounded-full bg-slate-100 items-center justify-center`}>
              <Ionicons name="close" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* COD Alert if applicable */}
          {isCod && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setCashCollectedCheck(!cashCollectedCheck)}
              style={[
                tw`flex-row items-center p-3 rounded-2xl border mb-3`,
                {
                  backgroundColor: cashCollectedCheck ? '#ECFDF5' : '#FFFBEB',
                  borderColor: cashCollectedCheck ? '#10B981' : '#F59E0B',
                },
              ]}
            >
              <Ionicons
                name={cashCollectedCheck ? 'checkbox' : 'square-outline'}
                size={18}
                color={cashCollectedCheck ? '#047857' : '#D97706'}
                style={tw`mr-2.5`}
              />
              <View style={tw`flex-1`}>
                <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11 }]}>
                  Collected ₹{order.totalAmount} in Cash
                </Text>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
                  Confirm cash received before handing over grocery bag
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* OTP Input Section */}
          <View style={tw`p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-4`}>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 10, fontWeight: '800' }]}>
                ENTER 4-DIGIT CUSTOMER OTP
              </Text>
              <TouchableOpacity
                onPress={handleAutoFill}
                style={tw`px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300`}
              >
                <Text style={[Typography.badge, { color: '#047857', fontSize: 9 }]}>
                  Auto-fill ({order.otp || '4821'})
                </Text>
              </TouchableOpacity>
            </View>

            {/* OTP Input with xs placeholder */}
            <TextInput
              value={otp}
              onChangeText={(txt) => {
                setOtp(txt);
                setErrorMsg('');
              }}
              placeholder="Enter 4-digit OTP"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={4}
              style={[
                tw`py-2.5 px-3 rounded-xl bg-white border text-center font-black`,
                {
                  borderColor: errorMsg ? '#DC2626' : otp ? '#047857' : '#CBD5E1',
                  fontSize: otp ? 18 : 11, // xs font size for placeholder
                  letterSpacing: otp ? 6 : 0,
                  color: '#0F172A',
                },
              ]}
            />

            {errorMsg ? (
              <Text style={[Typography.caption, { color: '#DC2626', fontSize: 9.5, marginTop: 4, textAlign: 'center' }]}>
                {errorMsg}
              </Text>
            ) : null}
          </View>

          {/* Complete Action Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleVerify}
            style={tw`w-full py-3.5 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-sm`}
          >
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={tw`mr-1.5`} />
            <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 12.5, fontWeight: '900' }]}>
              VERIFY & COMPLETE ORDER
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
