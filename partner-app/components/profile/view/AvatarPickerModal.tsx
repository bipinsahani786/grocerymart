import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../constants/typography';
import tw from 'twrnc';

interface AvatarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onPickCamera: () => void;
  onPickGallery: () => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  visible,
  onClose,
  onPickCamera,
  onPickGallery,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[tw`flex-1 justify-end`, { backgroundColor: 'rgba(15, 23, 42, 0.65)' }]}>
        <View style={tw`bg-white rounded-t-3xl border-t border-emerald-500 shadow-2xl p-4 pb-7`}>
          {/* Grabber */}
          <View style={tw`w-10 h-1 bg-slate-200 rounded-full self-center mb-3`} />

          {/* Title */}
          <View style={tw`flex-row justify-between items-center pb-3 border-b border-slate-100 mb-3`}>
            <View>
              <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 14, fontWeight: '900' }]}>
                Update Profile Avatar
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                Upload a clear captain photo for customer verification
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={tw`w-7 h-7 rounded-full bg-slate-100 items-center justify-center`}
            >
              <Ionicons name="close" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={tw`gap-2.5 mb-4`}>
            {/* Option 1: Camera */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onPickCamera}
              style={tw`p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex-row items-center justify-between`}
            >
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-9 h-9 rounded-xl bg-emerald-600 items-center justify-center mr-3 shadow-sm`}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[Typography.bodyBold, { color: '#064E3B', fontSize: 12.5 }]}>
                    Take Photo with Camera
                  </Text>
                  <Text style={[Typography.caption, { color: '#047857', fontSize: 10 }]}>
                    Take a new selfie in delivery uniform
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#047857" />
            </TouchableOpacity>

            {/* Option 2: Gallery */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onPickGallery}
              style={tw`p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex-row items-center justify-between`}
            >
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-9 h-9 rounded-xl bg-blue-600 items-center justify-center mr-3 shadow-sm`}>
                  <Ionicons name="images" size={16} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12.5 }]}>
                    Choose from Photo Gallery
                  </Text>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                    Select existing photo from device album
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={tw`w-full py-3 rounded-2xl bg-slate-100 border border-slate-200 items-center justify-center`}
          >
            <Text style={[Typography.buttonText, { color: '#64748B', fontSize: 11.5 }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
