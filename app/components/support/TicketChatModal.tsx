import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { theme } from '../../constants/theme';
import { useAuthContext } from '../../context/AuthContext';
import { supportService, SupportTicket } from '../../services/support.service';
import tw from 'twrnc';

const GROCERYMART_LOGO = require('../../assets/images/zytrixon.png');

interface TicketChatModalProps {
  visible: boolean;
  ticketId: string | null;
  onClose: () => void;
}

export const TicketChatModal: React.FC<TicketChatModalProps> = ({
  visible,
  ticketId,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { user: authUser } = useAuthContext();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const senderInitial =
    authUser?.name?.trim()?.[0]?.toUpperCase() ||
    ticket?.user?.name?.trim()?.[0]?.toUpperCase() ||
    'U';

  const loadTicketDetails = React.useCallback(async () => {
    if (!ticketId) return;
    setIsLoading(true);
    try {
      const data = await supportService.getTicketDetails(ticketId);
      setTicket(data);
    } catch (err) {
      console.warn('Failed to load ticket details', err);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (visible) {
      if (Platform.OS === 'android') {
        try {
          NavigationBar.setBackgroundColorAsync('#FFFFFF').catch(() => {});
          NavigationBar.setButtonStyleAsync('dark').catch(() => {});
        } catch {}
      }
      if (ticketId) {
        loadTicketDetails();
      }
    }
  }, [visible, ticketId, loadTicketDetails]);

  const handleSendMessage = async () => {
    if (!ticketId || !replyText.trim() || isSending) return;
    setIsSending(true);

    try {
      const newMsg = await supportService.sendTicketMessage(ticketId, replyText.trim());
      if (newMsg && ticket) {
        setTicket({
          ...ticket,
          messages: [...(ticket.messages || []), newMsg],
          status: 'OPEN',
        });
        setReplyText('');
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err) {
      console.warn('Failed to send message', err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={tw`flex-1 bg-[#F8FAFC]`}
      >
        <StatusBar style="light" backgroundColor={theme.colors.primary} translucent />

        {/* Full-Screen Top Header with Safe Insets (Matching Profile Gradient) */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark || '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            tw`px-4 pb-3.5 flex-row items-center justify-between shadow-sm z-20`,
            { paddingTop: Math.max(insets.top, 16) + 6 },
          ]}
        >
          <View style={tw`flex-row items-center gap-3 flex-1 mr-2`}>
            <TouchableOpacity
              onPress={onClose}
              style={tw`w-9 h-9 rounded-lg bg-white/20 border border-white/30 items-center justify-center`}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={19} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center gap-1.5`}>
                <Text style={tw`text-xs font-mono font-black text-white/90`}>
                  {ticket?.ticketNumber || 'TICKET'}
                </Text>
                <View
                  style={[
                    tw`px-2 py-0.2 rounded-full border bg-white/20 border-white/30`,
                  ]}
                >
                  <Text style={tw`text-[8.5px] font-black uppercase text-white`}>
                    {ticket?.status || 'OPEN'}
                  </Text>
                </View>
              </View>

              <Text style={tw`text-xs font-black text-white truncate mt-0.5`} numberOfLines={1}>
                {ticket?.subject || 'Support Chat'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={loadTicketDetails}
            style={tw`w-8 h-8 rounded-lg bg-white/20 border border-white/30 items-center justify-center`}
          >
            <Ionicons name="refresh" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Resolution Banner */}
        {ticket?.resolutionNote && (
          <View style={tw`bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex-row items-start gap-2 z-20`}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" style={tw`mt-0.5`} />
            <View style={tw`flex-1`}>
              <Text style={tw`text-[10px] font-black text-emerald-900 uppercase`}>Resolution Note</Text>
              <Text style={tw`text-[11px] text-emerald-800 font-medium leading-4 mt-0.5`}>
                {ticket.resolutionNote}
              </Text>
            </View>
          </View>
        )}

        {/* ── Main Chat Area with Green Tint Overlay & Flash Screen Watermark ── */}
        <View style={tw`flex-1 relative overflow-hidden bg-[#F0FDF4]`}>
          {/* 0. Soft Emerald / Green Tint Wallpaper Layer */}
          <LinearGradient
            colors={['#ECFDF5', '#F0FDF4', '#E6F7ED']}
            style={tw`absolute inset-0`}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          {/* 1. Background Splash Stripes (Subtle Watermark matching SplashScreen) */}
          <View
            pointerEvents="none"
            style={[
              tw`absolute rounded-3xl`,
              {
                top: -80,
                left: -40,
                width: 130,
                height: 480,
                transform: [{ rotate: '-35deg' }],
                opacity: 0.05,
                backgroundColor: theme.colors.primaryDark || '#047857',
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              tw`absolute rounded-3xl`,
              {
                top: 80,
                right: -60,
                width: 90,
                height: 520,
                transform: [{ rotate: '-35deg' }],
                opacity: 0.04,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              tw`absolute rounded-3xl`,
              {
                bottom: -100,
                left: 40,
                width: 110,
                height: 420,
                transform: [{ rotate: '-35deg' }],
                opacity: 0.04,
                backgroundColor: theme.colors.primaryDark || '#047857',
              },
            ]}
          />

          {/* 2. Centered Flash Watermark Logo & Tagline */}
          <View
            pointerEvents="none"
            style={tw`absolute inset-0 items-center justify-center px-6`}
          >
            <View
              style={[
                tw`w-28 h-28 rounded-full items-center justify-center p-3`,
                {
                  opacity: 0.055,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <Image
                source={GROCERYMART_LOGO}
                style={tw`w-20 h-20`}
                resizeMode="contain"
              />
            </View>
            <Text
              style={[
                tw`text-xl font-extrabold tracking-widest text-center mt-2.5 uppercase`,
                {
                  opacity: 0.065,
                  color: theme.colors.primaryDark || '#047857',
                },
              ]}
            >
              Grocery Mart
            </Text>
            <Text
              style={[
                tw`text-[10px] text-center font-bold tracking-wider mt-0.5`,
                {
                  opacity: 0.055,
                  color: theme.colors.primaryDark || '#047857',
                },
              ]}
            >
              Freshness & Quality Delivered Daily
            </Text>
          </View>

          {/* 3. Live Message Thread */}
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              tw`p-3 gap-1.5`,
              { paddingBottom: Math.max(insets.bottom, 16) + 20 },
            ]}
            style={tw`flex-1 z-10`}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={tw`py-20 items-center justify-center`}>
                <ActivityIndicator size="small" color="#059669" />
                <Text style={tw`text-xs font-bold text-slate-400 mt-2`}>Loading conversation...</Text>
              </View>
            ) : ticket?.messages && ticket.messages.length > 0 ? (
              ticket.messages.map((msg, index) => {
                const isCustomer = msg.senderRole === 'CUSTOMER';
                return (
                  <View
                    key={msg.id || index}
                    style={[
                      tw`flex-row items-end gap-1.5 w-full mb-1`,
                      isCustomer ? tw`justify-end` : tw`justify-start`,
                    ]}
                  >
                    {/* Grocery Mart Support Logo Avatar (Receiver Side) */}
                    {!isCustomer && (
                      <View style={tw`w-6.5 h-6.5 rounded-full bg-white border border-emerald-200 items-center justify-center shrink-0 mb-0.5 shadow-2xs overflow-hidden p-0.5`}>
                        <Image
                          source={GROCERYMART_LOGO}
                          style={tw`w-full h-full`}
                          resizeMode="contain"
                        />
                      </View>
                    )}

                    {/* Message Bubble Content */}
                    <View
                      style={[
                        tw`max-w-[84%] px-3 py-1.5 rounded-2xl shadow-2xs`,
                        isCustomer
                          ? tw`bg-emerald-700 rounded-br-xs`
                          : tw`bg-white border border-emerald-900/10 rounded-bl-xs`,
                      ]}
                    >
                      <View style={tw`flex-row items-center justify-between gap-3 mb-0.5`}>
                        <Text
                          style={[
                            tw`text-[9.5px] font-black`,
                            isCustomer ? tw`text-emerald-200` : tw`text-emerald-800`,
                          ]}
                        >
                          {isCustomer ? 'You' : 'Grocery Mart Support'}
                        </Text>
                        <Text
                          style={[
                            tw`text-[8px] font-medium`,
                            isCustomer ? tw`text-emerald-300/80` : tw`text-slate-400`,
                          ]}
                        >
                          {formatTime(msg.createdAt)}
                        </Text>
                      </View>

                      <Text
                        style={[
                          tw`text-[13px] font-medium`,
                          { lineHeight: 17 },
                          isCustomer ? tw`text-white` : tw`text-slate-900`,
                        ]}
                      >
                        {msg.message}
                      </Text>
                    </View>

                    {/* Customer Name First Letter Initial Circle Icon (Sender Side) */}
                    {isCustomer && (
                      <View style={tw`w-6.5 h-6.5 rounded-full bg-emerald-800 border border-white/50 items-center justify-center shrink-0 mb-0.5 shadow-2xs`}>
                        <Text style={tw`text-[10px] font-black text-white uppercase`}>
                          {senderInitial}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={tw`p-2.5 bg-white/95 rounded-xl border border-emerald-900/10 shadow-2xs max-w-[94%]`}>
                <Text style={tw`text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5`}>Initial Inquiry</Text>
                <Text style={[tw`text-[13px] text-slate-800 font-medium`, { lineHeight: 17 }]}>{ticket?.description}</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Reply Input Bar */}
        <View
          style={[
            tw`p-3 bg-white border-t border-slate-200 flex-row items-center gap-2 shadow-sm z-20`,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <TextInput
            placeholder="Type your message to support..."
            value={replyText}
            onChangeText={setReplyText}
            style={tw`flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900`}
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!replyText.trim() || isSending}
            style={[
              tw`w-10 h-10 rounded-xl bg-emerald-700 items-center justify-center shadow-sm`,
              (!replyText.trim() || isSending) && tw`opacity-50`,
            ]}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Safe bottom area filler ensuring white background behind Android/iOS navigation bar */}
        <View style={{ height: Math.max(insets.bottom, 0), backgroundColor: '#FFFFFF' }} />
      </KeyboardAvoidingView>
    </Modal>
  );
};
