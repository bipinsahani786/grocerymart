import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface HelmetCheckinModalProps {
  visible: boolean;
  onClose: () => void;
  onCheckinSuccess: () => void;
}

export const HelmetCheckinModal: React.FC<HelmetCheckinModalProps> = ({
  visible,
  onClose,
  onCheckinSuccess,
}) => {
  const [selfieTaken, setSelfieTaken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const sampleRiderSelfie = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800';

  const handleCapture = () => {
    setSelfieTaken(true);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 1000);
  };

  const handleConfirm = () => {
    setSelfieTaken(false);
    onCheckinSuccess();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={[tw`flex-1 justify-end`, { backgroundColor: 'rgba(15, 23, 42, 0.7)' }]}>
        <View style={tw`bg-white rounded-t-3xl border-t border-emerald-500 shadow-2xl p-4 pb-7`}>
          {/* Grabber */}
          <View style={tw`w-10 h-1 rounded-full bg-slate-200 self-center mb-2`} />

          {/* Header */}
          <View style={tw`flex-row justify-between items-center pb-3 border-b border-slate-100 mb-3`}>
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <View style={tw`w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 items-center justify-center mr-2.5`}>
                <Ionicons name="shield-checkmark" size={15} color="#047857" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13 }]}>
                  Daily Safety & Helmet Check-In
                </Text>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
                  Quick safety compliance before starting duty
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={tw`w-7 h-7 rounded-full bg-slate-100 items-center justify-center`}>
              <Ionicons name="close" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Guidelines Strip */}
          <View style={tw`p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex-row items-center justify-between mb-3`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="checkmark-circle" size={13} color="#047857" style={tw`mr-1`} />
              <Text style={[Typography.caption, { color: '#334155', fontSize: 9.5, fontWeight: '700' }]}>
                Wear Helmet
              </Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="checkmark-circle" size={13} color="#047857" style={tw`mr-1`} />
              <Text style={[Typography.caption, { color: '#334155', fontSize: 9.5, fontWeight: '700' }]}>
                Delivery Bag Ready
              </Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="checkmark-circle" size={13} color="#047857" style={tw`mr-1`} />
              <Text style={[Typography.caption, { color: '#334155', fontSize: 9.5, fontWeight: '700' }]}>
                Face Clear
              </Text>
            </View>
          </View>

          {/* Camera Viewfinder */}
          {!selfieTaken ? (
            <View style={tw`h-60 rounded-2xl bg-slate-900 overflow-hidden items-center justify-center relative mb-3`}>
              {/* Circular Oval Face Mask */}
              <View style={tw`w-36 h-48 rounded-full border-2 border-dashed border-emerald-400 items-center justify-center`}>
                <Ionicons name="person-outline" size={44} color="#A7F3D0" />
              </View>

              <Text style={[Typography.caption, { color: '#CBD5E1', fontSize: 10, marginTop: 8 }]}>
                Position your face with helmet inside the oval
              </Text>

              {/* Shutter Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleCapture}
                style={tw`absolute bottom-3 self-center w-12 h-12 rounded-full bg-white border-4 border-emerald-500 items-center justify-center shadow-lg`}
              >
                <View style={tw`w-8 h-8 rounded-full bg-emerald-600`} />
              </TouchableOpacity>
            </View>
          ) : (
            /* Verified Selfie Preview */
            <View style={tw`h-60 rounded-2xl overflow-hidden relative mb-3 bg-slate-900 border border-slate-200`}>
              <Image source={{ uri: sampleRiderSelfie }} style={tw`w-full h-full`} />

              {/* AI Verification Badge */}
              <View style={tw`absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-slate-900/85 border border-slate-700 flex-row items-center justify-between`}>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="checkmark-circle" size={16} color="#34D399" style={tw`mr-2`} />
                  <View>
                    <Text style={[Typography.caption, { color: '#34D399', fontSize: 10, fontWeight: '800' }]}>
                      {isVerifying ? 'Verifying AI Compliance...' : 'HELMET & UNIFORM VERIFIED'}
                    </Text>
                    <Text style={[Typography.caption, { color: '#FFFFFF', fontSize: 8.5 }]}>
                      Ready for high-paying instant deliveries
                    </Text>
                  </View>
                </View>
              </View>
            </View>
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
              onPress={handleConfirm}
              disabled={!selfieTaken || isVerifying}
              style={[
                tw`flex-2 py-3 rounded-2xl items-center justify-center flex-row shadow-sm`,
                { backgroundColor: selfieTaken && !isVerifying ? '#047857' : '#CBD5E1' },
              ]}
            >
              <Ionicons name="power" size={15} color="#FFFFFF" style={tw`mr-1.5`} />
              <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 12, fontWeight: '800' }]}>
                GO ONLINE & RECEIVE ORDERS
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
