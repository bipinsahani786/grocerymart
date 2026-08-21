import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { theme } from '../../constants/theme';
import { supportService, SupportTicket } from '../../services/support.service';
import { TicketChatModal } from './TicketChatModal';
import tw from 'twrnc';

interface ContactSupportModalProps {
  visible: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

interface CategoryItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'DELIVERY', label: 'Delivery Delay', icon: 'bicycle-outline', color: '#F59E0B' },
  { id: 'MISSING_ITEMS', label: 'Missing Item', icon: 'cube-outline', color: '#EC4899' },
  { id: 'QUALITY', label: 'Quality / Freshness', icon: 'leaf-outline', color: '#10B981' },
  { id: 'REFUND', label: 'Refund / Payment', icon: 'card-outline', color: '#3B82F6' },
  { id: 'PAYMENT', label: 'Payment Issue', icon: 'cash-outline', color: '#8B5CF6' },
  { id: 'APP_ISSUE', label: 'App / Bug', icon: 'phone-portrait-outline', color: '#64748B' },
  { id: 'OTHER', label: 'Other Help', icon: 'help-circle-outline', color: '#059669' },
];

const FAQS = [
  {
    q: 'How fast is instant delivery?',
    a: 'We deliver all essentials within 10-15 minutes from your nearest hyper-local partner dark store.',
  },
  {
    q: 'What if an item is missing or damaged?',
    a: 'Simply raise a ticket here under "Missing Item" or "Quality" and our support team will issue an instant refund or replacement.',
  },
  {
    q: 'How do refunds work?',
    a: 'Refunds for online payments are processed instantly to your wallet or original payment source within 24-48 hours.',
  },
  {
    q: 'Can I cancel my order after placing?',
    a: 'Orders can be cancelled before they are packed and handed over to the delivery partner.',
  },
];

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  visible,
  onClose,
  initialOrderId,
}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'raise' | 'tickets' | 'faq'>('tickets');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('ALL');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Form states
  const [category, setCategory] = useState('DELIVERY');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat modal state
  const [selectedChatTicketId, setSelectedChatTicketId] = useState<string | null>(null);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const loadTickets = React.useCallback(async () => {
    setIsLoadingTickets(true);
    try {
      const data = await supportService.getMyTickets();
      setTickets(data);
      if (data.length === 0 && !initialOrderId) {
        setActiveTab('raise');
      }
    } catch (err) {
      console.warn('Failed to load tickets', err);
    } finally {
      setIsLoadingTickets(false);
    }
  }, [initialOrderId]);

  useEffect(() => {
    if (visible) {
      if (Platform.OS === 'android') {
        try {
          NavigationBar.setBackgroundColorAsync('#FFFFFF').catch(() => { });
          NavigationBar.setButtonStyleAsync('dark').catch(() => { });
        } catch { }
      }
      loadTickets();
      if (initialOrderId) {
        setOrderId(initialOrderId);
        setActiveTab('raise');
      }
    }
  }, [visible, initialOrderId, loadTickets]);

  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Required Fields', 'Please enter both Subject and Description to raise your ticket.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await supportService.createTicket({
        category,
        subject: subject.trim(),
        description: description.trim(),
        orderId: orderId.trim() || null,
        priority,
      });

      if (created) {
        Alert.alert('Ticket Raised 🚀', `Your ticket #${created.ticketNumber} has been sent to our customer support team. We will resolve it promptly!`);
        setSubject('');
        setDescription('');
        setOrderId('');
        loadTickets();
        setActiveTab('tickets');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to raise ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChat = (ticketId: string) => {
    setSelectedChatTicketId(ticketId);
    setIsChatVisible(true);
  };

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'ALL') return tickets;
    return tickets.filter((t) => t.status === statusFilter);
  }, [tickets, statusFilter]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-[#F8FAFC]`}>
        <StatusBar style="light" backgroundColor="#047857" translucent />

        {/* Full Screen Top Header with Safe Area Insets (Matching Profile Gradient) */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark || '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            tw`px-4 pb-3.5 flex-row items-center justify-between shadow-sm`,
            { paddingTop: Math.max(insets.top, 16) + 6 },
          ]}
        >
          <View style={tw`flex-row items-center gap-3 flex-1 mr-2`}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              style={tw`w-9 h-9 rounded-lg bg-white/20 border border-white/30 items-center justify-center`}
            >
              <Ionicons name="arrow-back" size={19} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={tw`flex-row items-center gap-2.5 flex-1`}>
              <View style={tw`w-8 h-8 rounded-lg bg-white/20 border border-white/30 items-center justify-center`}>
                <Ionicons name="headset" size={17} color="#FFFFFF" />
              </View>
              <View>
                <Text style={tw`text-sm font-black text-white`}>24x7 Customer Support</Text>
                <Text style={tw`text-[10px] font-bold text-white/80`}>Help & Resolution Desk</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={loadTickets}
            style={tw`w-8 h-8 rounded-lg bg-white/20 border border-white/30 items-center justify-center`}
          >
            <Ionicons name="refresh" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Tab Switcher */}
        <View style={tw`flex-row bg-white border-b border-slate-200 px-4 py-2 gap-2 shadow-xs`}>
          <TouchableOpacity
            onPress={() => setActiveTab('tickets')}
            style={[
              tw`flex-1 py-2.5 rounded-lg flex-row items-center justify-center gap-1.5`,
              activeTab === 'tickets' ? tw`bg-emerald-50 border border-emerald-600` : tw`bg-slate-50`,
            ]}
          >
            <Ionicons name="ticket-outline" size={14} color={activeTab === 'tickets' ? '#059669' : '#64748B'} />
            <Text style={[tw`text-[11.5px] font-black`, activeTab === 'tickets' ? tw`text-emerald-800` : tw`text-slate-600`]}>
              My Tickets ({tickets.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('raise')}
            style={[
              tw`flex-1 py-2.5 rounded-lg flex-row items-center justify-center gap-1.5`,
              activeTab === 'raise' ? tw`bg-emerald-50 border border-emerald-600` : tw`bg-slate-50`,
            ]}
          >
            <Ionicons name="add-circle-outline" size={14} color={activeTab === 'raise' ? '#059669' : '#64748B'} />
            <Text style={[tw`text-[11.5px] font-black`, activeTab === 'raise' ? tw`text-emerald-800` : tw`text-slate-600`]}>
              Raise Ticket
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('faq')}
            style={[
              tw`px-3 py-2.5 rounded-lg flex-row items-center justify-center gap-1`,
              activeTab === 'faq' ? tw`bg-emerald-50 border border-emerald-600` : tw`bg-slate-50`,
            ]}
          >
            <Ionicons name="help-buoy-outline" size={14} color={activeTab === 'faq' ? '#059669' : '#64748B'} />
            <Text style={[tw`text-[11.5px] font-black`, activeTab === 'faq' ? tw`text-emerald-800` : tw`text-slate-600`]}>
              FAQs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Full-Screen Scrollable Body */}
        <ScrollView
          contentContainerStyle={[
            tw`p-4`,
            { paddingBottom: Math.max(insets.bottom, 16) + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'tickets' ? (
            /* ──── 1. MY TICKETS LIST ──── */
            <View style={tw`gap-2.5`}>
              {/* Status Filter Chips */}
              {tickets.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-1`} contentContainerStyle={tw`gap-1.5`}>
                  {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((st) => (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setStatusFilter(st)}
                      style={[
                        tw`px-2.5 py-1 rounded-full border`,
                        statusFilter === st
                          ? tw`bg-emerald-700 border-emerald-700`
                          : tw`bg-white border-slate-200`,
                      ]}
                    >
                      <Text
                        style={[
                          tw`text-[10px] font-black uppercase`,
                          statusFilter === st ? tw`text-white` : tw`text-slate-600`,
                        ]}
                      >
                        {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {isLoadingTickets ? (
                <View style={tw`py-24 items-center justify-center`}>
                  <ActivityIndicator size="small" color="#059669" />
                  <Text style={tw`text-xs font-bold text-slate-400 mt-2`}>Loading your tickets...</Text>
                </View>
              ) : tickets.length === 0 ? (
                <View style={tw`bg-white p-8 rounded-xl border border-slate-200 items-center justify-center mt-4 shadow-sm`}>
                  <Ionicons name="checkmark-done-circle-outline" size={54} color="#059669" />
                  <Text style={tw`text-base font-black text-slate-900 mt-2`}>No Active Tickets</Text>
                  <Text style={tw`text-xs text-slate-400 text-center mt-1`}>
                    You do not have any unresolved support tickets.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActiveTab('raise')}
                    style={tw`mt-4 px-5 py-2.5 bg-emerald-700 rounded-lg shadow-sm`}
                  >
                    <Text style={tw`text-xs font-black text-white`}>+ Raise New Ticket</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredTickets.map((t) => {
                  const categoryMeta = CATEGORIES.find((c) => c.id === t.category) || {
                    id: 'OTHER',
                    label: 'Inquiry',
                    icon: 'help-circle-outline',
                    color: '#059669',
                  };

                  const isUrgent = t.priority === 'URGENT' || t.priority === 'HIGH';

                  const statusConfig =
                    t.status === 'OPEN'
                      ? {
                          bg: 'bg-amber-50',
                          border: 'border-amber-200/80',
                          text: 'text-amber-700',
                          dot: 'bg-amber-500',
                          iconColor: '#D97706',
                          label: 'Open',
                        }
                      : t.status === 'IN_PROGRESS'
                      ? {
                          bg: 'bg-blue-50',
                          border: 'border-blue-200/80',
                          text: 'text-blue-700',
                          dot: 'bg-blue-500',
                          iconColor: '#2563EB',
                          label: 'In Progress',
                        }
                      : t.status === 'RESOLVED'
                      ? {
                          bg: 'bg-emerald-50',
                          border: 'border-emerald-200/80',
                          text: 'text-emerald-700',
                          dot: 'bg-emerald-500',
                          iconColor: '#059669',
                          label: 'Resolved',
                        }
                      : {
                          bg: 'bg-slate-100',
                          border: 'border-slate-200',
                          text: 'text-slate-600',
                          dot: 'bg-slate-400',
                          iconColor: '#64748B',
                          label: 'Closed',
                        };

                  const formattedDate = new Date(t.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => handleOpenChat(t.id)}
                      activeOpacity={0.78}
                      style={tw`bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs mb-2`}
                    >
                      {/* Row 1: Category Icon + Subject Title + Status Pill */}
                      <View style={tw`flex-row items-center justify-between gap-2.5`}>
                        <View style={tw`flex-row items-center gap-2 flex-1 min-w-0`}>
                          {/* Category Squircle */}
                          <View
                            style={[
                              tw`w-8 h-8 rounded-lg items-center justify-center shrink-0`,
                              { backgroundColor: `${categoryMeta.color}15` },
                            ]}
                          >
                            <Ionicons
                              name={categoryMeta.icon as any}
                              size={15}
                              color={categoryMeta.color}
                            />
                          </View>

                          {/* Subject Title */}
                          <Text
                            style={tw`text-[13px] font-black text-slate-900 truncate flex-1 tracking-tight`}
                            numberOfLines={1}
                          >
                            {t.subject}
                          </Text>
                        </View>

                        {/* Live Status Pill */}
                        <View
                          style={[
                            tw`px-2.2 py-0.6 rounded-full border flex-row items-center gap-1 shrink-0`,
                            tw`${statusConfig.bg} ${statusConfig.border}`,
                          ]}
                        >
                          <View style={[tw`w-1.5 h-1.5 rounded-full`, tw`${statusConfig.dot}`]} />
                          <Text
                            style={[
                              tw`text-[9px] font-black uppercase tracking-wider`,
                              tw`${statusConfig.text}`,
                            ]}
                          >
                            {statusConfig.label}
                          </Text>
                        </View>
                      </View>

                      {/* Row 2: Metadata & Quick Info Strip */}
                      <View style={tw`flex-row items-center justify-between mt-2 pt-1.5 border-t border-slate-100/90`}>
                        <View style={tw`flex-row items-center gap-2 flex-1 min-w-0 flex-wrap`}>
                          {/* Ticket Number */}
                          <Text style={tw`text-[10px] font-mono font-bold text-slate-500`}>
                            #{t.ticketNumber}
                          </Text>

                          {isUrgent && (
                            <>
                              <Text style={tw`text-[10px] text-slate-300`}>•</Text>
                              <View style={tw`px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200`}>
                                <Text style={tw`text-[8px] font-black uppercase text-rose-600`}>
                                  {t.priority}
                                </Text>
                              </View>
                            </>
                          )}

                          <Text style={tw`text-[10px] text-slate-300`}>•</Text>

                          {/* Date */}
                          <Text style={tw`text-[10px] font-medium text-slate-400`}>
                            {formattedDate}
                          </Text>

                          {/* Linked Order Badge if exists */}
                          {t.order && (
                            <>
                              <Text style={tw`text-[10px] text-slate-300`}>•</Text>
                              <View style={tw`flex-row items-center gap-0.8`}>
                                <Ionicons name="bag-handle" size={9.5} color="#059669" />
                                <Text style={tw`text-[10px] font-bold text-emerald-800`}>
                                  ₹{t.order.totalAmount}
                                </Text>
                              </View>
                            </>
                          )}

                          {/* Message Counter if replies exist */}
                          {t.messages && t.messages.length > 0 && (
                            <>
                              <Text style={tw`text-[10px] text-slate-300`}>•</Text>
                              <View style={tw`flex-row items-center gap-0.8`}>
                                <Ionicons name="chatbubble-ellipses" size={9.5} color="#64748B" />
                                <Text style={tw`text-[10px] font-bold text-slate-500`}>
                                  {t.messages.length}
                                </Text>
                              </View>
                            </>
                          )}

                          {/* Resolution Check if resolved */}
                          {t.resolutionNote && (
                            <>
                              <Text style={tw`text-[10px] text-slate-300`}>•</Text>
                              <Text style={tw`text-[9.5px] font-black text-emerald-700`}>
                                Resolved ✅
                              </Text>
                            </>
                          )}
                        </View>

                        {/* Right Arrow */}
                        <Ionicons name="chevron-forward" size={13} color="#94A3B8" />
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ) : activeTab === 'raise' ? (
            /* ──── 2. RAISE NEW TICKET FORM ──── */
            <View style={tw`bg-white p-4 rounded-xl border border-slate-200/90 gap-4 shadow-sm`}>
              {/* Category Picker */}
              <View>
                <Text style={tw`text-[11px] font-black uppercase tracking-wider text-slate-600 mb-2`}>
                  Select Problem Category
                </Text>
                <View style={tw`flex-row flex-wrap gap-1.5`}>
                  {CATEGORIES.map((c) => {
                    const isSelected = category === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        onPress={() => setCategory(c.id)}
                        style={[
                          tw`px-3 py-2 rounded-lg border flex-row items-center gap-1.5`,
                          isSelected ? tw`bg-emerald-700 border-emerald-700` : tw`bg-slate-50 border-slate-200`,
                        ]}
                      >
                        <Ionicons name={c.icon as any} size={12} color={isSelected ? '#FFFFFF' : '#64748B'} />
                        <Text style={[tw`text-[10.5px] font-black`, isSelected ? tw`text-white` : tw`text-slate-700`]}>
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Order ID Tag (Optional) */}
              <View>
                <Text style={tw`text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1`}>
                  Order Number (Optional)
                </Text>
                <TextInput
                  placeholder="e.g. DEL-2024-0012 or Order ID"
                  value={orderId}
                  onChangeText={setOrderId}
                  style={tw`bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-bold`}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Subject */}
              <View>
                <Text style={tw`text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1`}>
                  Subject / Brief Issue *
                </Text>
                <TextInput
                  placeholder="e.g., Milk packet was leaked, Missing 1 item"
                  value={subject}
                  onChangeText={setSubject}
                  style={tw`bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-bold`}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Description */}
              <View>
                <Text style={tw`text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1`}>
                  Detailed Explanation *
                </Text>
                <TextInput
                  placeholder="Please describe what went wrong so our support team can resolve or refund..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  style={tw`bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-900 h-28`}
                  textAlignVertical="top"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Urgency / Priority */}
              <View>
                <Text style={tw`text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1.5`}>
                  Urgency Level
                </Text>
                <View style={tw`flex-row gap-2`}>
                  {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPriority(p)}
                      style={[
                        tw`flex-1 py-2 rounded-lg border items-center`,
                        priority === p ? tw`bg-slate-900 border-slate-900` : tw`bg-slate-50 border-slate-200`,
                      ]}
                    >
                      <Text style={[tw`text-[10px] font-black`, priority === p ? tw`text-white` : tw`text-slate-600`]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleCreateTicket}
                disabled={isSubmitting}
                style={[
                  tw`w-full py-3.5 bg-emerald-700 rounded-xl items-center justify-center flex-row gap-2 mt-2 shadow-sm`,
                  isSubmitting && tw`opacity-60`,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="paper-plane" size={15} color="#FFFFFF" />
                    <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
                      Submit Support Ticket
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* ──── 3. FAQS ──── */
            <View style={tw`gap-3`}>
              {FAQS.map((f, idx) => (
                <View key={idx} style={tw`bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm`}>
                  <View style={tw`flex-row items-center gap-2 mb-1.5`}>
                    <Ionicons name="help-circle" size={16} color="#059669" />
                    <Text style={tw`text-xs font-black text-slate-900 flex-1`}>{f.q}</Text>
                  </View>
                  <Text style={tw`text-[12px] text-slate-600 leading-5 pl-6 font-medium`}>{f.a}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Live Chat Modal */}
        <TicketChatModal
          visible={isChatVisible}
          ticketId={selectedChatTicketId}
          onClose={() => {
            setIsChatVisible(false);
            loadTickets();
          }}
        />

        {/* Safe bottom area filler ensuring white background behind Android/iOS navigation bar */}
        <View style={{ height: Math.max(insets.bottom, 0), backgroundColor: '#FFFFFF' }} />
      </View>
    </Modal>
  );
};
