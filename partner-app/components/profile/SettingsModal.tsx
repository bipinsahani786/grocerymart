import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Platform,
  StatusBar as RNStatusBar,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageContext, LanguageCode } from '../../context/LanguageContext';
import { useSettingsContext, NavAppOption } from '../../context/SettingsContext';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

type SubPage = 'MAIN' | 'RATE_CARD' | 'PRIVACY' | 'ABOUT';

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, onLogout }) => {
  const insets = useSafeAreaInsets();
  const { language, setLanguage, t } = useLanguageContext();
  const { settings, updateSetting, clearCache, getNavAppName } = useSettingsContext();

  const [activeSubPage, setActiveSubPage] = useState<SubPage>('MAIN');
  const [showNavPicker, setShowNavPicker] = useState(false);

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const safeTop = Math.max(statusBarHeight, insets.top, 14);

  // Handle hardware back button on Android so sub-pages go back to MAIN first
  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      if (showNavPicker) {
        setShowNavPicker(false);
        return true;
      }
      if (activeSubPage !== 'MAIN') {
        setActiveSubPage('MAIN');
        return true; // Prevent modal closing
      }
      return false; // Allow default modal closing on MAIN
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [visible, activeSubPage, showNavPicker]);

  const handleBackNavigation = () => {
    if (showNavPicker) {
      setShowNavPicker(false);
    } else if (activeSubPage !== 'MAIN') {
      setActiveSubPage('MAIN');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleBackNavigation}
      statusBarTranslucent
    >
      <View style={tw`flex-1 bg-white`}>
        {/* ================= 1. FULL-SCREEN EMERALD APP BAR ================= */}
        <View
          style={[
            tw`px-4 pb-3.5 bg-[#047857] flex-row items-center justify-between shadow-md`,
            { paddingTop: safeTop + 6 },
          ]}
        >
          <View style={tw`flex-row items-center flex-1 mr-2`}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBackNavigation}
              style={tw`w-8 h-8 rounded-full bg-emerald-800 items-center justify-center mr-2.5`}
            >
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={tw`flex-1`}>
              <Text style={[Typography.cardTitle, { color: '#FFFFFF', fontSize: 15, fontWeight: '900' }]}>
                {activeSubPage === 'MAIN'
                  ? 'Settings & Preferences'
                  : activeSubPage === 'RATE_CARD'
                  ? 'Partner Rate Card & Terms'
                  : activeSubPage === 'PRIVACY'
                  ? 'Privacy Policy & Data Consent'
                  : 'About GroceryMart Fleet'}
              </Text>
              <Text style={[Typography.caption, { color: '#D1FAE5', fontSize: 10 }]}>
                {activeSubPage === 'MAIN'
                  ? 'Audio, navigation & legal specifications'
                  : activeSubPage === 'RATE_CARD'
                  ? 'Official payout calculation, surge & quest structure'
                  : activeSubPage === 'PRIVACY'
                  ? 'Comprehensive data rights, GPS tracking & protection'
                  : 'Enterprise logistics platform, specifications & support'}
              </Text>
            </View>
          </View>
        </View>

        {/* ================= 2. VIEW CONTROLLER ================= */}
        {activeSubPage === 'MAIN' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              tw`px-5 py-4 gap-4`,
              { paddingBottom: Math.max(insets.bottom, 24) + 40 },
            ]}
          >
            {/* ================= SECTION 1: AUDIO & SOUND ALERTS ================= */}
            <View style={tw`border-b border-slate-100 pb-4`}>
              <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
                AUDIO & NOTIFICATIONS
              </Text>

              {/* Siren Alert */}
              <View style={tw`flex-row justify-between items-center py-2.5`}>
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                  <Ionicons
                    name={settings.soundAlerts ? 'volume-high' : 'volume-mute-outline'}
                    size={17}
                    color={settings.soundAlerts ? '#047857' : '#94A3B8'}
                    style={tw`mr-3`}
                  />
                  <View style={tw`flex-1`}>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                      {t.orderSiren}
                    </Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                      {settings.soundAlerts
                        ? 'Loud ringtone active for incoming delivery requests'
                        : 'Siren alerts currently muted (silent request mode)'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.soundAlerts}
                  onValueChange={(val) => updateSetting('soundAlerts', val)}
                  trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Screen Wake */}
              <View style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}>
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                  <Ionicons
                    name={settings.screenWake ? 'phone-portrait' : 'phone-portrait-outline'}
                    size={17}
                    color={settings.screenWake ? '#047857' : '#94A3B8'}
                    style={tw`mr-3`}
                  />
                  <View style={tw`flex-1`}>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                      Wake Screen on New Order
                    </Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                      {settings.screenWake
                        ? 'Turns on phone display automatically when order rings'
                        : 'Keep phone screen off on incoming orders'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.screenWake}
                  onValueChange={(val) => updateSetting('screenWake', val)}
                  trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Voice Guidance */}
              <View style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}>
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                  <Ionicons
                    name={settings.voiceGuidance ? 'mic' : 'mic-off-outline'}
                    size={17}
                    color={settings.voiceGuidance ? '#047857' : '#94A3B8'}
                    style={tw`mr-3`}
                  />
                  <View style={tw`flex-1`}>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                      Voice Prompts & Notes
                    </Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                      {settings.voiceGuidance
                        ? 'Speaks customer delivery instructions automatically'
                        : 'Voice note playback disabled'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.voiceGuidance}
                  onValueChange={(val) => updateSetting('voiceGuidance', val)}
                  trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* ================= SECTION 2: NAVIGATION & MAPS ================= */}
            <View style={tw`border-b border-slate-100 pb-4`}>
              <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
                NAVIGATION & MAPS
              </Text>

              {/* Default Nav App */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowNavPicker(true)}
                style={tw`flex-row justify-between items-center py-2.5`}
              >
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                  <Ionicons name="navigate" size={17} color="#2563EB" style={tw`mr-3`} />
                  <View style={tw`flex-1`}>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                      Default Navigation App
                    </Text>
                    <Text style={[Typography.caption, { color: '#2563EB', fontSize: 10, fontWeight: '700' }]}>
                      {getNavAppName()}
                    </Text>
                  </View>
                </View>
                <View style={tw`flex-row items-center bg-blue-50 px-2 py-1 rounded-md border border-blue-200`}>
                  <Text style={tw`text-[10px] font-bold text-blue-700 mr-1`}>Change</Text>
                  <Ionicons name="chevron-forward" size={12} color="#2563EB" />
                </View>
              </TouchableOpacity>

              {/* Auto Navigate Switch */}
              <View style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}>
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                  <Ionicons
                    name={settings.autoNavigate ? 'arrow-redo' : 'arrow-redo-outline'}
                    size={17}
                    color={settings.autoNavigate ? '#047857' : '#94A3B8'}
                    style={tw`mr-3`}
                  />
                  <View style={tw`flex-1`}>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                      {t.autoNav}
                    </Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                      {settings.autoNavigate
                        ? 'Opens directions immediately upon accepting order'
                        : 'Require manual button tap to launch navigation'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.autoNavigate}
                  onValueChange={(val) => updateSetting('autoNavigate', val)}
                  trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* ================= SECTION 3: REALTIME APP LANGUAGE SELECTOR ================= */}
            <View style={tw`border-b border-slate-100 pb-4`}>
              <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
                {t.appLanguage}
              </Text>

              <View style={tw`flex-row gap-2 mt-1`}>
                {[
                  { code: 'EN' as LanguageCode, name: 'English' },
                  { code: 'HI' as LanguageCode, name: 'हिन्दी' },
                  { code: 'KN' as LanguageCode, name: 'ಕನ್ನಡ' },
                ].map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    activeOpacity={0.8}
                    onPress={() => {
                      setLanguage(lang.code);
                    }}
                    style={[
                      tw`flex-1 py-2.5 rounded-xl items-center justify-center border shadow-sm`,
                      {
                        backgroundColor: language === lang.code ? '#ECFDF5' : '#F8FAFC',
                        borderColor: language === lang.code ? '#10B981' : '#E2E8F0',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        Typography.caption,
                        {
                          color: language === lang.code ? '#047857' : '#475569',
                          fontSize: 11,
                          fontWeight: language === lang.code ? '900' : '600',
                        },
                      ]}
                    >
                      {lang.name} {language === lang.code ? '✓' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ================= SECTION 4: DUTY OPTIMIZATION ================= */}
            <View style={tw`border-b border-slate-100 pb-4`}>
              <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
                DUTY & PERFORMANCE
              </Text>

              {/* Battery Saver Switch */}
              <View style={tw`flex-row justify-between items-center py-2.5`}>
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                  <Ionicons
                    name={settings.batterySaver ? 'battery-charging' : 'battery-charging-outline'}
                    size={17}
                    color={settings.batterySaver ? '#D97706' : '#64748B'}
                    style={tw`mr-3`}
                  />
                  <View style={tw`flex-1`}>
                    <View style={tw`flex-row items-center`}>
                      <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                        Battery Saver Shift Mode
                      </Text>
                      {settings.batterySaver && (
                        <View style={tw`ml-2 px-1.5 py-0.2 rounded bg-amber-100 border border-amber-300`}>
                          <Text style={tw`text-[9px] font-extrabold text-amber-800`}>ACTIVE ⚡</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                      {settings.batterySaver
                        ? 'Optimized GPS 15s polling active (Saves battery)'
                        : 'Standard continuous high-accuracy GPS tracking'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.batterySaver}
                  onValueChange={(val) => updateSetting('batterySaver', val)}
                  trackColor={{ false: '#E2E8F0', true: '#F59E0B' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Clear Cache */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={clearCache}
                style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}
              >
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                  <Ionicons name="trash-outline" size={17} color="#475569" style={tw`mr-3`} />
                  <View style={tw`flex-1`}>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                      Clear Offline Map Cache
                    </Text>
                    <Text style={[Typography.caption, { color: settings.cacheSize === 0 ? '#059669' : '#64748B', fontSize: 10, fontWeight: settings.cacheSize === 0 ? '700' : '400' }]}>
                      {settings.cacheSize === 0
                        ? '0.0 MB • Storage Clean & Optimized 🎉'
                        : `Free up ${settings.cacheSize} MB local map storage`}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
              </TouchableOpacity>
            </View>

            {/* ================= SECTION 5: LEGAL & ABOUT (CLICKABLE SUB-PAGES) ================= */}
            <View style={tw`pb-2`}>
              <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
                LEGAL & FLEET POLICIES
              </Text>

              {/* Rate Card Trigger */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveSubPage('RATE_CARD')}
                style={tw`flex-row justify-between items-center py-3`}
              >
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                  <Ionicons name="receipt-outline" size={17} color="#047857" style={tw`mr-3`} />
                  <View style={tw`flex-1`}>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                      Partner Rate Card & Terms of Service
                    </Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                      Base pay, distance rates, surge & quest bonuses
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
              </TouchableOpacity>

              {/* Privacy Policy Trigger */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveSubPage('PRIVACY')}
                style={tw`flex-row justify-between items-center py-3 border-t border-slate-50`}
              >
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                  <Ionicons name="shield-checkmark-outline" size={17} color="#047857" style={tw`mr-3`} />
                  <View style={tw`flex-1`}>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                      Privacy Policy & Location Consent
                    </Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                      Background GPS, KYC encryption & data rights
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
              </TouchableOpacity>

              {/* About App Trigger */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveSubPage('ABOUT')}
                style={tw`flex-row justify-between items-center py-3 border-t border-slate-50`}
              >
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                  <Ionicons name="information-circle-outline" size={17} color="#2563EB" style={tw`mr-3`} />
                  <View style={tw`flex-1`}>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                      About GroceryMart Fleet
                    </Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                      App build v2.4.0 • Enterprise partner support
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* ================= MODAL: DEFAULT NAVIGATION APP PICKER ================= */}
        <Modal
          visible={showNavPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNavPicker(false)}
        >
          <View style={tw`flex-1 bg-black/50 items-center justify-center px-5`}>
            <View style={tw`w-full bg-white rounded-3xl p-5 shadow-2xl border border-slate-100`}>
              <View style={tw`flex-row items-center justify-between pb-3 border-b border-slate-100`}>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="navigate" size={20} color="#2563EB" style={tw`mr-2`} />
                  <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 16, fontWeight: '800' }]}>
                    Select Default Nav App
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowNavPicker(false)}>
                  <Ionicons name="close-circle" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text style={[Typography.caption, { color: '#64748B', fontSize: 11, marginVertical: 10 }]}>
                Choose your preferred mapping provider for turn-by-turn routing during delivery trips:
              </Text>

              <View style={tw`gap-2.5 my-2`}>
                {[
                  { id: 'google_maps' as NavAppOption, title: 'Google Maps', subtitle: 'Recommended for precise street routing in India', icon: 'map' },
                  { id: 'waze' as NavAppOption, title: 'Waze Navigation', subtitle: 'Real-time traffic hazard & radar alerts', icon: 'car-sport' },
                  { id: 'apple_maps' as NavAppOption, title: 'Apple Maps', subtitle: 'Native iOS direction engine', icon: 'compass' },
                  { id: 'in_app' as NavAppOption, title: 'In-App OpenStreetMap', subtitle: 'Lightweight offline map viewer inside app', icon: 'globe' },
                ].map((item) => {
                  const isSelected = settings.defaultNavApp === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        updateSetting('defaultNavApp', item.id);
                        setShowNavPicker(false);
                      }}
                      style={[
                        tw`p-3.5 rounded-2xl border flex-row items-center justify-between`,
                        {
                          backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                          borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                        },
                      ]}
                    >
                      <View style={tw`flex-row items-center flex-1 mr-2`}>
                        <View style={[tw`w-9 h-9 rounded-xl items-center justify-center mr-3`, { backgroundColor: isSelected ? '#2563EB' : '#E2E8F0' }]}>
                          <Ionicons name={item.icon as any} size={18} color={isSelected ? '#FFFFFF' : '#475569'} />
                        </View>
                        <View style={tw`flex-1`}>
                          <Text style={[Typography.bodyBold, { color: isSelected ? '#1E40AF' : '#0F172A', fontSize: 13 }]}>
                            {item.title}
                          </Text>
                          <Text style={[Typography.caption, { color: isSelected ? '#1D4ED8' : '#64748B', fontSize: 10 }]}>
                            {item.subtitle}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowNavPicker(false)}
                style={tw`mt-2 py-3 bg-slate-900 rounded-xl items-center justify-center`}
              >
                <Text style={tw`text-white text-xs font-bold`}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ================= SUB-PAGE 1: DETAILED RATE CARD & TERMS ================= */}
        {activeSubPage === 'RATE_CARD' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              tw`px-5 py-4 gap-4`,
              { paddingBottom: Math.max(insets.bottom, 24) + 40 },
            ]}
          >
            {/* Base Pay Tier Card */}
            <View style={tw`p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm`}>
              <Text style={[Typography.caption, { color: '#064E3B', fontSize: 10, fontWeight: '800' }]}>
                STANDARD DELIVERY PAYOUT STRUCTURE
              </Text>
              <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 24, marginTop: 2 }]}>
                ₹45 Base Pay + ₹12/km
              </Text>
              <Text style={[Typography.caption, { color: '#065F46', fontSize: 10.5, marginTop: 4, lineHeight: 15 }]}>
                Calculated dynamically from Dark Store pickup rack to customer doorstep location using Google Maps verified shortest road route.
              </Text>
            </View>

            {/* Detailed Payout Matrix */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-200`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800', marginBottom: 8 }]}>
                📊 DETAILED PAYOUT MATRIX
              </Text>

              <View style={tw`gap-2.5`}>
                <View style={tw`flex-row justify-between items-center py-1.5 border-b border-slate-200/60`}>
                  <View>
                    <Text style={[Typography.bodyBold, { color: '#334155', fontSize: 11.5 }]}>Base Distance Component</Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>Includes first 2.0 km transit</Text>
                  </View>
                  <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 13 }]}>₹45.00</Text>
                </View>

                <View style={tw`flex-row justify-between items-center py-1.5 border-b border-slate-200/60`}>
                  <View>
                    <Text style={[Typography.bodyBold, { color: '#334155', fontSize: 11.5 }]}>Additional Distance Pay</Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>Beyond 2.0 km up to 15 km limit</Text>
                  </View>
                  <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 13 }]}>₹12.00 / km</Text>
                </View>

                <View style={tw`flex-row justify-between items-center py-1.5 border-b border-slate-200/60`}>
                  <View>
                    <Text style={[Typography.bodyBold, { color: '#334155', fontSize: 11.5 }]}>Store Wait Compensation</Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>Auto-credited after 5 mins wait</Text>
                  </View>
                  <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 13 }]}>₹2.00 / min</Text>
                </View>

                <View style={tw`flex-row justify-between items-center py-1.5`}>
                  <View>
                    <Text style={[Typography.bodyBold, { color: '#334155', fontSize: 11.5 }]}>Customer Tip Credit</Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>100% credited to partner wallet</Text>
                  </View>
                  <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 13 }]}>100% Direct</Text>
                </View>
              </View>
            </View>

            {/* Surge Matrix */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-200`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800', marginBottom: 8 }]}>
                ⚡ PEAK HOUR & SURGE MULTIPLIERS
              </Text>

              <View style={tw`gap-2.5`}>
                <View style={tw`flex-row justify-between items-center py-1.5 border-b border-slate-200/60`}>
                  <View>
                    <Text style={[Typography.bodyBold, { color: '#334155', fontSize: 11.5 }]}>Lunch Peak Window</Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>12:00 PM – 03:00 PM daily</Text>
                  </View>
                  <Text style={[Typography.amountLarge, { color: '#D97706', fontSize: 13 }]}>+₹25 / Order</Text>
                </View>

                <View style={tw`flex-row justify-between items-center py-1.5 border-b border-slate-200/60`}>
                  <View>
                    <Text style={[Typography.bodyBold, { color: '#334155', fontSize: 11.5 }]}>Dinner Peak Window</Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>07:00 PM – 11:00 PM daily</Text>
                  </View>
                  <Text style={[Typography.amountLarge, { color: '#D97706', fontSize: 13 }]}>+₹35 / Order</Text>
                </View>

                <View style={tw`flex-row justify-between items-center py-1.5`}>
                  <View>
                    <Text style={[Typography.bodyBold, { color: '#334155', fontSize: 11.5 }]}>Monsoon / Bad Weather Surge</Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>Triggered during heavy rainfall</Text>
                  </View>
                  <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 13 }]}>+₹40 / Order</Text>
                </View>
              </View>
            </View>

            {/* Milestone Quests */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-200`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800', marginBottom: 8 }]}>
                🏆 DAILY & WEEKEND MILESTONE QUESTS
              </Text>

              <View style={tw`gap-2.5`}>
                <View style={tw`flex-row justify-between items-center py-1.5 border-b border-slate-200/60`}>
                  <View style={tw`flex-1 mr-2`}>
                    <Text style={[Typography.bodyBold, { color: '#334155', fontSize: 11.5 }]}>Daily Starter Quest</Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>Complete 15 orders between 06 AM - 12 AM</Text>
                  </View>
                  <Text style={[Typography.badge, { color: '#047857', fontSize: 10 }]}>+₹250 Bonus</Text>
                </View>

                <View style={tw`flex-row justify-between items-center py-1.5 border-b border-slate-200/60`}>
                  <View style={tw`flex-1 mr-2`}>
                    <Text style={[Typography.bodyBold, { color: '#334155', fontSize: 11.5 }]}>Daily Pro Quest</Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>Complete 25 orders in a single calendar day</Text>
                  </View>
                  <Text style={[Typography.badge, { color: '#047857', fontSize: 10 }]}>+₹500 Bonus</Text>
                </View>

                <View style={tw`flex-row justify-between items-center py-1.5`}>
                  <View style={tw`flex-1 mr-2`}>
                    <Text style={[Typography.bodyBold, { color: '#334155', fontSize: 11.5 }]}>Weekend Monster Quest</Text>
                    <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>Complete 40 combined orders on Saturday & Sunday</Text>
                  </View>
                  <Text style={[Typography.badge, { color: '#B45309', fontSize: 10 }]}>+₹1,200 Bonus</Text>
                </View>
              </View>
            </View>

            {/* Terms Clauses */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-200`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800', marginBottom: 8 }]}>
                📜 ESSENTIAL PARTNER FLEET AGREEMENT
              </Text>

              <View style={tw`gap-3`}>
                <Text style={[Typography.caption, { color: '#475569', fontSize: 10.5, lineHeight: 16 }]}>
                  1. <Text style={tw`font-bold text-slate-800`}>Instant Settlement Rights</Text>: Earnings accrue directly into your Pro Rider Wallet upon OTP confirmation. Instant payouts via IMPS incur zero gateway fees.
                </Text>
                <Text style={[Typography.caption, { color: '#475569', fontSize: 10.5, lineHeight: 16 }]}>
                  2. <Text style={tw`font-bold text-slate-800`}>Floating Cash Collection (COD)</Text>: Cash collected must be deposited to the dark store counter or settled via UPI once it exceeds ₹1,500 to prevent automated shift lock.
                </Text>
                <Text style={[Typography.caption, { color: '#475569', fontSize: 10.5, lineHeight: 16 }]}>
                  3. <Text style={tw`font-bold text-slate-800`}>Safety & Uniform Compliance</Text>: Mandatory wearing of helmet, reflective delivery jacket, and insulated grocery bag during all active delivery shifts.
                </Text>
                <Text style={[Typography.caption, { color: '#475569', fontSize: 10.5, lineHeight: 16 }]}>
                  4. <Text style={tw`font-bold text-slate-800`}>Zero-Tolerance Policy</Text>: Unjustified trip cancellation or tampering with customer packages will result in immediate partner account review and temporary deactivation.
                </Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* ================= SUB-PAGE 2: COMPREHENSIVE PRIVACY POLICY & DATA CONSENT ================= */}
        {activeSubPage === 'PRIVACY' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              tw`px-5 py-4 gap-4`,
              { paddingBottom: Math.max(insets.bottom, 24) + 40 },
            ]}
          >
            {/* Location Consent Hero */}
            <View style={tw`p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm`}>
              <View style={tw`flex-row items-center mb-2`}>
                <Ionicons name="location" size={18} color="#2563EB" style={tw`mr-2`} />
                <Text style={[Typography.caption, { color: '#1E40AF', fontSize: 11.5, fontWeight: '800' }]}>
                  BACKGROUND GPS & GEOLOCATION CONSENT
                </Text>
              </View>
              <Text style={[Typography.caption, { color: '#1E3A8A', fontSize: 10.5, lineHeight: 16 }]}>
                GroceryMart Partner App collects continuous high-accuracy background location telemetry while your duty status is set to <Text style={tw`font-bold`}>ON DUTY</Text>. This enables automated dispatch algorithms to assign high-paying nearby orders, provides accurate doorstep ETAs to customers, and activates emergency 24/7 SOS safety tracking even when the app is running in the background or your device screen is locked.
              </Text>
            </View>

            {/* Section 1: Information We Collect */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-2.5`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800' }]}>
                1. PERSONAL & KYC DATA WE COLLECT
              </Text>

              <Text style={[Typography.caption, { color: '#475569', fontSize: 10.5, lineHeight: 16 }]}>
                To comply with Government of India logistics guidelines, we collect and store:
              </Text>

              <View style={tw`gap-2 pt-1`}>
                <Text style={[Typography.caption, { color: '#334155', fontSize: 10, lineHeight: 15 }]}>
                  • <Text style={tw`font-bold text-slate-900`}>Identity Verification</Text>: Full legal name, date of birth, personal mobile number, permanent address, and government-issued Aadhaar & PAN card numbers.
                </Text>
                <Text style={[Typography.caption, { color: '#334155', fontSize: 10, lineHeight: 15 }]}>
                  • <Text style={tw`font-bold text-slate-900`}>Fleet & License Data</Text>: Commercial Driving License (DL) details, vehicle registration certificate (RC), emission compliance certificates, and commercial vehicle insurance policies.
                </Text>
                <Text style={[Typography.caption, { color: '#334155', fontSize: 10, lineHeight: 15 }]}>
                  • <Text style={tw`font-bold text-slate-900`}>Financial Information</Text>: Bank account numbers, IFSC codes, and UPI Virtual Payment Addresses (VPA) required for instant IMPS earnings settlement.
                </Text>
              </View>
            </View>

            {/* Section 2: How Data is Shielded */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-2.5`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800' }]}>
                2. VIRTUAL NUMBER MASKING & ENCRYPTION
              </Text>

              <View style={tw`gap-2.5`}>
                <View>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11.5 }]}>
                    Encrypted Phone Proxy Bridge
                  </Text>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 10, marginTop: 2, lineHeight: 15 }]}>
                    Customers and dark store managers never receive your real personal mobile number. All in-app calls and quick chats route through secure 2-way virtual bridge proxies to protect your personal identity.
                  </Text>
                </View>

                <View style={tw`pt-2.5 border-t border-slate-200/60`}>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11.5 }]}>
                    AES-256 Banking Grade Storage
                  </Text>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 10, marginTop: 2, lineHeight: 15 }]}>
                    All KYC records and bank credentials are encrypted at rest using AES-256 hardware security modules adhering strictly to Reserve Bank of India (RBI) cyber-security directives.
                  </Text>
                </View>
              </View>
            </View>

            {/* Section 3: Device Permissions */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-2.5`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800' }]}>
                3. DEVICE PERMISSIONS & INTENT
              </Text>

              <View style={tw`gap-2`}>
                <Text style={[Typography.caption, { color: '#334155', fontSize: 10, lineHeight: 15 }]}>
                  • <Text style={tw`font-bold text-slate-900`}>Camera Permission</Text>: Used strictly for daily helmet safety check-ins and contactless doorstep proof-of-delivery photo capture.
                </Text>
                <Text style={[Typography.caption, { color: '#334155', fontSize: 10, lineHeight: 15 }]}>
                  • <Text style={tw`font-bold text-slate-900`}>Storage Permission</Text>: Used locally on your device to cache OpenStreetMap tiles (reducing mobile data usage by up to 60%).
                </Text>
                <Text style={[Typography.caption, { color: '#334155', fontSize: 10, lineHeight: 15 }]}>
                  • <Text style={tw`font-bold text-slate-900`}>Notification & Siren Permission</Text>: Required to ring high-volume audio alerts when new delivery requests are dispatched to your radar.
                </Text>
              </View>
            </View>

            {/* Section 4: Data Control & Retention */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-2.5`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800' }]}>
                4. DATA RETENTION & PARTNER RIGHTS
              </Text>

              <Text style={[Typography.caption, { color: '#475569', fontSize: 10.5, lineHeight: 16 }]}>
                GPS logs and trip trajectories are stored for 90 days for audit and dispute resolution, after which location data is anonymized. You reserve the right to request a complete export of your trip ledger or request account data purge upon permanent fleet resignation by contacting <Text style={tw`font-bold text-slate-900`}>privacy@grocerymart.in</Text>.
              </Text>
            </View>
          </ScrollView>
        )}

        {/* ================= SUB-PAGE 3: DETAILED ABOUT GROCERYMART FLEET ================= */}
        {activeSubPage === 'ABOUT' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              tw`px-5 py-4 gap-4`,
              { paddingBottom: Math.max(insets.bottom, 24) + 40 },
            ]}
          >
            {/* App Hero Header */}
            <View style={tw`items-center py-5 border-b border-slate-100`}>
              <View style={tw`w-16 h-16 rounded-2xl bg-emerald-600 items-center justify-center mb-3 shadow-md`}>
                <Ionicons name="basket" size={34} color="#FFFFFF" />
              </View>
              <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 18, fontWeight: '900' }]}>
                GroceryMart Partner App
              </Text>
              <Text style={[Typography.caption, { color: '#047857', fontSize: 11, fontWeight: '700', marginTop: 1 }]}>
                India's Premier 10-Minute Quick Commerce Network
              </Text>
              <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, marginTop: 2 }]}>
                Version 2.4.0 (Build 8820) Enterprise Release
              </Text>
            </View>

            {/* Company Overview */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-2.5`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800' }]}>
                🚀 ABOUT GROCERYMART LOGISTICS
              </Text>

              <Text style={[Typography.caption, { color: '#475569', fontSize: 10.5, lineHeight: 16 }]}>
                GroceryMart Logistics Pvt Ltd powers India's fastest hyperlocal grocery fulfillment infrastructure. Operating across 25+ automated dark store hubs in metro regions, our mission is to empower delivery partners with transparent earnings, instant daily cashouts, and safety-first fleet management.
              </Text>
            </View>

            {/* Dark Store Architecture */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-2.5`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800' }]}>
                🏬 DARK STORE & RACK LOCATOR SYSTEM
              </Text>

              <Text style={[Typography.caption, { color: '#475569', fontSize: 10.5, lineHeight: 16 }]}>
                Our proprietary micro-fulfillment technology organizes over 10,000+ SKUs into designated rack numbers (e.g. Rack #B-04 • Shelf 2). This cuts partner store pickup time to under 120 seconds, allowing delivery partners to complete 3-4 trips per hour safely.
              </Text>
            </View>

            {/* Partner Insurance & Welfare */}
            <View style={tw`p-4 rounded-2xl bg-emerald-50 border border-emerald-200 gap-2.5`}>
              <Text style={[Typography.caption, { color: '#064E3B', fontSize: 11, fontWeight: '800' }]}>
                🏥 PARTNER WELFARE & INSURANCE COVER
              </Text>

              <Text style={[Typography.caption, { color: '#065F46', fontSize: 10.5, lineHeight: 16 }]}>
                Every active GroceryMart Captain is automatically covered under our ₹5,00,000 Group Accidental & Health Insurance Policy from Day 1. Includes OPD consultations, hospital cash allowance, and 24/7 SOS emergency ambulance dispatch.
              </Text>
            </View>

            {/* 24/7 Fleet Helpdesk */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-3`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800' }]}>
                🎧 24/7 DEDICATED PARTNER HELPDESK
              </Text>

              <View style={tw`flex-row items-center py-1`}>
                <Ionicons name="call" size={16} color="#047857" style={tw`mr-3`} />
                <View>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>Toll-Free Captain Helpline</Text>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>1800-419-8822 (Available 24/7)</Text>
                </View>
              </View>

              <View style={tw`flex-row items-center py-1 border-t border-slate-200/60`}>
                <Ionicons name="mail" size={16} color="#2563EB" style={tw`mr-3`} />
                <View>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>Settlements & Disputes Email</Text>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>partner-help@grocerymart.in</Text>
                </View>
              </View>

              <View style={tw`flex-row items-center py-1 border-t border-slate-200/60`}>
                <Ionicons name="business" size={16} color="#7C3AED" style={tw`mr-3`} />
                <View>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>Corporate Headquarters</Text>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>GroceryMart Logistics India Pvt Ltd</Text>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5, marginTop: 1 }]}>Plot 14, 80 Feet Road, Koramangala 4th Block, Bengaluru, KA 560034</Text>
                </View>
              </View>
            </View>

            {/* Technical Specifications & Legal Certifications */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-2.5`}>
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '800' }]}>
                ⚙️ TECHNICAL & COMPLIANCE CERTIFICATIONS
              </Text>

              <View style={tw`gap-2`}>
                <View style={tw`flex-row justify-between items-center py-1 border-b border-slate-200/60`}>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>GIS Mapping Engine</Text>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 10.5 }]}>FreeOpenStreetMap + Leaflet 1.9.4</Text>
                </View>
                <View style={tw`flex-row justify-between items-center py-1 border-b border-slate-200/60`}>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>Security Protocols</Text>
                  <Text style={[Typography.bodyBold, { color: '#047857', fontSize: 10.5 }]}>256-Bit SSL + ISO 27001 Certified</Text>
                </View>
                <View style={tw`flex-row justify-between items-center py-1 border-b border-slate-200/60`}>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>Food Safety License</Text>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 10.5 }]}>FSSAI Reg #11224333000192</Text>
                </View>
                <View style={tw`flex-row justify-between items-center py-1`}>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>Active Dark Store Hubs</Text>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 10.5 }]}>25+ Metro Fulfillment Centers</Text>
                </View>
              </View>
            </View>

            {/* Copyright Footer */}
            <View style={tw`py-3 items-center`}>
              <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10 }]}>
                © 2026 GroceryMart Logistics Pvt Ltd. All rights reserved.
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};
