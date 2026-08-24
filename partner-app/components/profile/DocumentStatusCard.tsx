import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { MOCK_KYC_DOCS } from '../../constants/mockData';

export const DocumentStatusCard: React.FC = () => {
  return (
    <View
      style={{
        backgroundColor: Colors.surfaceCard,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>
          KYC & PARTNER DOCUMENTS
        </Text>
        <View
          style={{
            backgroundColor: Colors.primaryBg,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.primaryDark }}>
            ALL VERIFIED
          </Text>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        {MOCK_KYC_DOCS.map((doc) => (
          <View
            key={doc.id}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: Colors.surfaceLight,
              padding: 10,
              borderRadius: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
              <View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text }}>
                  {doc.title}
                </Text>
                <Text style={{ fontSize: 10, color: Colors.textMuted }}>
                  {doc.expiry}
                </Text>
              </View>
            </View>

            <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
          </View>
        ))}
      </View>
    </View>
  );
};
