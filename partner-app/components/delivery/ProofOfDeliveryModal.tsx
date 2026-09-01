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

interface ProofOfDeliveryModalProps {
  visible: boolean;
  orderNumber: string;
  customerAddress: string;
  onClose: () => void;
  onPhotoConfirmed: () => void;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({
  visible,
  orderNumber,
  customerAddress,
  onClose,
  onPhotoConfirmed,
}) => {
  const [photoTaken, setPhotoTaken] = useState(false);
  const sampleDoorstepPhoto = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800';

  const handleCapture = () => {
    setPhotoTaken(true);
  };

  const handleRetake = () => {
    setPhotoTaken(false);
  };

  const handleConfirm = () => {
    setPhotoTaken(false);
    onPhotoConfirmed();
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
              <View style={tw`w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 items-center justify-center mr-2.5`}>
                <Ionicons name="camera" size={15} color="#7C3AED" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13 }]}>
                  Contactless Proof of Delivery
                </Text>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
                  Order #{orderNumber} • Leave at Doorstep
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={tw`w-7 h-7 rounded-full bg-slate-100 items-center justify-center`}>
              <Ionicons name="close" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Camera Viewfinder / Preview */}
          {!photoTaken ? (
            <View style={tw`h-56 rounded-2xl bg-slate-900 overflow-hidden items-center justify-center relative mb-3`}>
              {/* Target Corner Guides */}
              <View style={tw`absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400`} />
              <View style={tw`absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400`} />
              <View style={tw`absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400`} />
              <View style={tw`absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400`} />

              <View style={tw`items-center p-4`}>
                <Ionicons name="scan-outline" size={36} color="#34D399" style={tw`mb-2`} />
                <Text style={[Typography.bodyBold, { color: '#FFFFFF', fontSize: 12, textAlign: 'center' }]}>
                  Align grocery bag at the customer's doorstep
                </Text>
                <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 9.5, textAlign: 'center', marginTop: 2 }]}>
                  Ensure house number or door is visible for proof
                </Text>
              </View>

              {/* Shutter Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleCapture}
                style={tw`absolute bottom-4 self-center w-14 h-14 rounded-full bg-white border-4 border-emerald-500 items-center justify-center shadow-lg`}
              >
                <View style={tw`w-10 h-10 rounded-full bg-emerald-600`} />
              </TouchableOpacity>
            </View>
          ) : (
            /* Photo Captured Preview with Timestamp Watermark */
            <View style={tw`h-56 rounded-2xl overflow-hidden relative mb-3 bg-slate-900 border border-slate-200`}>
              <Image source={{ uri: sampleDoorstepPhoto }} style={tw`w-full h-full`} />

              {/* Timestamp Watermark */}
              <View style={tw`absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-slate-900/80 border border-slate-700`}>
                <Text style={[Typography.caption, { color: '#34D399', fontSize: 9, fontWeight: '800' }]}>
                  ✓ VERIFIED DOORSTEP PHOTO • {new Date().toLocaleTimeString()}
                </Text>
                <Text style={[Typography.caption, { color: '#FFFFFF', fontSize: 8.5 }]} numberOfLines={1}>
                  {customerAddress}
                </Text>
              </View>

              {/* Retake Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleRetake}
                style={tw`absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 flex-row items-center`}
              >
                <Ionicons name="refresh" size={11} color="#FFFFFF" style={tw`mr-1`} />
                <Text style={[Typography.caption, { color: '#FFFFFF', fontSize: 9 }]}>Retake</Text>
              </TouchableOpacity>
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
              disabled={!photoTaken}
              style={[
                tw`flex-2 py-3 rounded-2xl items-center justify-center flex-row shadow-sm`,
                { backgroundColor: photoTaken ? '#047857' : '#CBD5E1' },
              ]}
            >
              <Ionicons name="checkmark-circle" size={15} color="#FFFFFF" style={tw`mr-1.5`} />
              <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 12, fontWeight: '800' }]}>
                SUBMIT PROOF & DELIVER
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
