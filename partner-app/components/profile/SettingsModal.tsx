import React from 'react';
import { View, Text, TouchableOpacity, Modal, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, onLogout }) => {
  const [autoAccept, setAutoAccept] = React.useState(false);
  const [soundAlerts, setSoundAlerts] = React.useState(true);
  const [highAccuracyGps, setHighAccuracyGps] = React.useState(true);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.85)',
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
            paddingBottom: 36,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>
              Partner Preferences & Settings
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Toggle options */}
          <View style={{ gap: 12, marginBottom: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: Colors.surfaceCard,
                padding: 12,
                borderRadius: 12,
              }}
            >
              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>
                  High Volume Order Alerts
                </Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                  Loud siren ringtone on new incoming requests
                </Text>
              </View>
              <Switch
                value={soundAlerts}
                onValueChange={setSoundAlerts}
                thumbColor={soundAlerts ? Colors.primary : Colors.textMuted}
                trackColor={{ false: Colors.border, true: 'rgba(16, 185, 129, 0.4)' }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: Colors.surfaceCard,
                padding: 12,
                borderRadius: 12,
              }}
            >
              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>
                  High Accuracy GPS Tracking
                </Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                  Realtime dark store proximity check
                </Text>
              </View>
              <Switch
                value={highAccuracyGps}
                onValueChange={setHighAccuracyGps}
                thumbColor={highAccuracyGps ? Colors.primary : Colors.textMuted}
                trackColor={{ false: Colors.border, true: 'rgba(16, 185, 129, 0.4)' }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: Colors.surfaceCard,
                padding: 12,
                borderRadius: 12,
              }}
            >
              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>
                  Auto Accept Nearby Orders
                </Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                  Automatically accept trips under 1.5 km
                </Text>
              </View>
              <Switch
                value={autoAccept}
                onValueChange={setAutoAccept}
                thumbColor={autoAccept ? Colors.primary : Colors.textMuted}
                trackColor={{ false: Colors.border, true: 'rgba(16, 185, 129, 0.4)' }}
              />
            </View>
          </View>

          {/* App version info */}
          <Text style={{ fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginBottom: 16 }}>
            GroceryMart Partner App v1.0.0 (Build 2026.08.24)
          </Text>

          {/* Logout button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onLogout}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderColor: Colors.danger,
              borderWidth: 1.5,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="log-out-outline" size={18} color={Colors.danger} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.danger }}>
              LOG OUT FROM PARTNER ACCOUNT
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
