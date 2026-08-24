import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useAuthContext } from '../../context/AuthContext';
import { useDutyContext } from '../../context/DutyContext';

export const VehicleInfoCard: React.FC = () => {
  const { user } = useAuthContext();
  const { batteryLevel, currentHub } = useDutyContext();

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
      <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 12 }}>
        VEHICLE & HUB ALLOCATION
      </Text>

      <View style={{ gap: 8 }}>
        <View
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
            <Ionicons name="bicycle" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Vehicle Type</Text>
          </View>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.text }}>
            Delivery Bike ({user?.vehicleNumber || 'KA-01-EQ-4921'})
          </Text>
        </View>

        <View
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
            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Vehicle Inspection</Text>
          </View>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primary }}>
            Active & Verified
          </Text>
        </View>

        <View
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
            <Ionicons name="storefront" size={16} color={Colors.blue} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Assigned Hub</Text>
          </View>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.text }}>
            {currentHub}
          </Text>
        </View>
      </View>
    </View>
  );
};
