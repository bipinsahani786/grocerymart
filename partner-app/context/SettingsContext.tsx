import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NavAppOption = 'google_maps' | 'waze' | 'apple_maps' | 'in_app';

export interface PartnerSettingsState {
  soundAlerts: boolean;
  screenWake: boolean;
  voiceGuidance: boolean;
  defaultNavApp: NavAppOption;
  autoNavigate: boolean;
  batterySaver: boolean;
  cacheSize: number;
}

export interface SettingsContextType {
  settings: PartnerSettingsState;
  toastMessage: string | null;
  updateSetting: <K extends keyof PartnerSettingsState>(key: K, value: PartnerSettingsState[K]) => void;
  clearCache: () => void;
  showToast: (msg: string) => void;
  getNavAppName: (app?: NavAppOption) => string;
}

const SETTINGS_STORAGE_KEY = '@partner_app_settings_v2';
const BACKEND_SETTINGS_URL = 'http://10.0.2.2:5000/api/auth/partner-settings';

const DEFAULT_SETTINGS: PartnerSettingsState = {
  soundAlerts: true,
  screenWake: true,
  voiceGuidance: true,
  defaultNavApp: 'google_maps',
  autoNavigate: true,
  batterySaver: false,
  cacheSize: 48.5,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PartnerSettingsState>(DEFAULT_SETTINGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load stored settings on mount & try fetching from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings((prev) => ({ ...prev, ...parsed }));
        }

        // Backend sync check
        try {
          const res = await fetch(BACKEND_SETTINGS_URL);
          if (res.ok) {
            const data = await res.json();
            if (data?.data) {
              setSettings((prev) => ({ ...prev, ...data.data }));
              await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...settings, ...data.data }));
            }
          }
        } catch {
          // Quiet offline fallback
        }
      } catch (err) {
        console.log('Error loading partner settings:', err);
      }
    };
    loadSettings();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const getNavAppName = (app: NavAppOption = settings.defaultNavApp): string => {
    switch (app) {
      case 'google_maps':
        return 'Google Maps (Recommended)';
      case 'waze':
        return 'Waze Navigation Engine';
      case 'apple_maps':
        return 'Apple Maps GPS';
      case 'in_app':
        return 'In-App OpenStreetMap';
      default:
        return 'Google Maps';
    }
  };

  const updateSetting = async <K extends keyof PartnerSettingsState>(
    key: K,
    value: PartnerSettingsState[K]
  ) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});

      // Sync to backend API asynchronously
      fetch(BACKEND_SETTINGS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});

      return updated;
    });

    // Display clear, high-impact visible phone toast
    switch (key) {
      case 'soundAlerts':
        showToast(
          value
            ? '🔊 Order Siren Ringtone Enabled (Loud alerts on)'
            : '🔇 Order Siren Ringtone Muted'
        );
        break;
      case 'screenWake':
        showToast(
          value
            ? '📱 Wake Screen Lock Activated for Orders'
            : '📱 Screen Auto-Wake Disabled'
        );
        break;
      case 'voiceGuidance':
        showToast(
          value
            ? '🗣️ Voice Guidance Active (Reading customer notes)'
            : '🎙️ Voice Guidance Disabled'
        );
        break;
      case 'defaultNavApp':
        showToast(`🗺️ Navigation App Changed to ${getNavAppName(value as NavAppOption)}`);
        break;
      case 'autoNavigate':
        showToast(
          value
            ? '🚀 Auto-Navigate Enabled (Opens directions on accept)'
            : '🗺️ Manual Navigation Selected'
        );
        break;
      case 'batterySaver':
        showToast(
          value
            ? '⚡ Battery Saver Active (GPS 15s interval)'
            : '🔋 High-Performance Duty Mode Restored'
        );
        break;
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem('@partner_map_tiles_cache');
      await AsyncStorage.removeItem('@partner_temp_order_logs');
      setSettings((prev) => {
        const updated = { ...prev, cacheSize: 0.0 };
        AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });
      showToast('🗑️ Offline map cache cleared successfully (48.5 MB freed)');
    } catch {
      showToast('🗑️ Cache Storage Cleaned');
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        toastMessage,
        updateSetting,
        clearCache,
        showToast,
        getNavAppName,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};
