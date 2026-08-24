import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface SupportHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SupportHelpModal: React.FC<SupportHelpModalProps> = ({ visible, onClose }) => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSendTicket = () => {
    if (!ticketSubject.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTicketSubject('');
      onClose();
    }, 1500);
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
            maxHeight: '85%',
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>
                24x7 Partner Support & SOS
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                Instant assistance for orders, payments & safety
              </Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* SOS Emergency Call Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                backgroundColor: Colors.dangerLight,
                borderColor: Colors.danger,
                borderWidth: 1.5,
                borderRadius: 14,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: Colors.danger,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="warning" size={22} color={Colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.danger }}>
                  Emergency SOS Hotline
                </Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                  Call Field Emergency & Police dispatch (112)
                </Text>
              </View>
              <Ionicons name="call" size={20} color={Colors.danger} />
            </TouchableOpacity>

            {/* Quick Helpline options */}
            <View style={{ gap: 10, marginBottom: 16 }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.surfaceCard,
                  borderColor: Colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Ionicons name="headset" size={20} color={Colors.primary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>
                    Call Partner Captain / Hub Manager
                  </Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                    +91 80 4912 8801 • Koramangala Hub #04
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.surfaceCard,
                  borderColor: Colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Ionicons name="wallet-outline" size={20} color={Colors.amber} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>
                    Payout & Settlement Discrepancy
                  </Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                    Instant ticket resolution within 30 mins
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Raise Help Ticket */}
            <View
              style={{
                backgroundColor: Colors.surfaceCard,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 8 }}>
                Quick Message / Report Issue
              </Text>
              <TextInput
                value={ticketSubject}
                onChangeText={setTicketSubject}
                placeholder="Describe your issue or order question..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: Colors.surfaceLight,
                  borderRadius: 10,
                  padding: 10,
                  color: Colors.text,
                  fontSize: 13,
                  textAlignVertical: 'top',
                  minHeight: 70,
                }}
              />

              {submitted ? (
                <Text style={{ color: Colors.primaryLight, fontWeight: '700', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                  ✓ Support ticket raised! A support agent is joining...
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleSendTicket}
                  style={{
                    backgroundColor: Colors.primary,
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.white }}>
                    Submit Message
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
