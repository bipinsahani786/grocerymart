import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { DeliveryOrder } from '../../constants/mockData';
import { useDeliveryContext } from '../../context/DeliveryContext';

interface StorePickupSectionProps {
  order: DeliveryOrder;
}

export const StorePickupSection: React.FC<StorePickupSectionProps> = ({ order }) => {
  const { updateActiveOrderStatus, toggleItemScanned } = useDeliveryContext();

  const isAtStore = order.status === 'AT_STORE';
  const allScanned = order.items.every((it) => it.scanned);

  const handleArrivedAtStore = () => {
    updateActiveOrderStatus('AT_STORE');
  };

  const handlePickedUp = () => {
    updateActiveOrderStatus('EN_ROUTE');
  };

  const handleScanAll = () => {
    order.items.forEach((item) => {
      if (!item.scanned) {
        toggleItemScanned(item.id);
      }
    });
  };

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Store Info Card */}
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Ionicons name="storefront" size={18} color={Colors.blue} />
            </View>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.text }}>
                {order.storeName}
              </Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 1 }}>
                Pickup Counter: Rack #B-04
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="call" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 10 }}>
          📍 {order.storeAddress}
        </Text>
      </View>

      {!isAtStore ? (
        /* Heading to store state */
        <View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleArrivedAtStore}
            style={{
              backgroundColor: Colors.blue,
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              shadowColor: Colors.blue,
              shadowOpacity: 0.4,
              shadowRadius: 8,
            }}
          >
            <Ionicons name="location" size={20} color={Colors.white} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.white }}>
              ARRIVED AT DARK STORE
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* At store item checklist & verification */
        <View
          style={{
            backgroundColor: Colors.surfaceCard,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>
                Package Items Checklist
              </Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                Verify items against order bag before leaving
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleScanAll}
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primaryLight }}>
                Verify All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Items list */}
          <View style={{ gap: 8, marginBottom: 16 }}>
            {order.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => toggleItemScanned(item.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: item.scanned ? 'rgba(16, 185, 129, 0.08)' : Colors.surfaceLight,
                  borderColor: item.scanned ? Colors.primary : Colors.border,
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Ionicons
                    name={item.scanned ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={item.scanned ? Colors.primary : Colors.textMuted}
                    style={{ marginRight: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: Colors.text,
                        textDecorationLine: item.scanned ? 'line-through' : 'none',
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                      Qty: {item.quantity} ({item.unit}) • ₹{item.price}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bag & Picked Up Confirmation */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePickedUp}
            style={{
              backgroundColor: allScanned ? Colors.primary : Colors.surfaceLight,
              borderColor: allScanned ? Colors.primary : Colors.border,
              borderWidth: 1,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="bag-check"
              size={18}
              color={allScanned ? Colors.textDark : Colors.textSecondary}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 15,
                fontWeight: '800',
                color: allScanned ? Colors.textDark : Colors.textSecondary,
              }}
            >
              CONFIRM PICKUP & START DELIVERY
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
