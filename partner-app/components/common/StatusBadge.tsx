import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '../../constants/theme';
import { DeliveryOrder } from '../../constants/mockData';

interface StatusBadgeProps {
  status: DeliveryOrder['status'];
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PENDING':
        return { label: 'New Request', bg: Colors.amberLight, text: Colors.amberDark, border: Colors.amber };
      case 'ACCEPTED':
        return { label: 'Heading to Store', bg: Colors.blueLight, text: Colors.blueDark, border: Colors.blue };
      case 'AT_STORE':
        return { label: 'At Dark Store', bg: Colors.purpleLight, text: Colors.purpleDark, border: Colors.purple };
      case 'PICKED_UP':
      case 'EN_ROUTE':
        return { label: 'En Route to Customer', bg: Colors.primaryBg, text: Colors.primaryDark, border: Colors.primary };
      case 'AT_CUSTOMER':
        return { label: 'At Doorstep (Verifying)', bg: Colors.amberLight, text: Colors.amberDark, border: Colors.amber };
      case 'DELIVERED':
        return { label: 'Delivered', bg: Colors.primaryBg, text: Colors.primaryDark, border: Colors.primary };
      case 'CANCELLED':
        return { label: 'Cancelled', bg: Colors.dangerLight, text: Colors.dangerDark, border: Colors.danger };
      default:
        return { label: status, bg: Colors.surfaceLight, text: Colors.textSecondary, border: Colors.border };
    }
  };

  const config = getBadgeConfig();

  return (
    <View
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '700', color: config.text }}>
        {config.label}
      </Text>
    </View>
  );
};
