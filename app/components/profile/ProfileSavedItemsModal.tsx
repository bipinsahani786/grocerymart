import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { useSavedItems } from '../../context/SavedItemsContext';
import { Product } from '../../data/groceryData';
import { ProductCard } from '../ProductCard';
import tw from 'twrnc';

interface ProfileSavedItemsModalProps {
  visible: boolean;
  onClose: () => void;
  onPressProduct?: (product: Product) => void;
}

export const ProfileSavedItemsModal: React.FC<ProfileSavedItemsModalProps> = ({
  visible,
  onClose,
  onPressProduct,
}) => {
  const insets = useSafeAreaInsets();
  const { savedItems, clearSavedItems } = useSavedItems();

  const handleClearAll = () => {
    Alert.alert(
      'Clear Saved Items',
      'Are you sure you want to remove all saved items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearSavedItems },
      ]
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-[#F8FAFC]`}>
        <StatusBar style="light" backgroundColor={theme.colors.primary} translucent />

        {/* ── 1. Full Screen Top Header with Matching Brand Gradient ── */}
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
              style={tw`w-9 h-9 rounded-lg bg-white/20 border border-white/30 items-center justify-center`}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={19} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center gap-1.5`}>
                <Text style={tw`text-sm font-black text-white`}>
                  Saved Items ({savedItems.length})
                </Text>
                <View style={tw`px-2 py-0.2 rounded-full bg-white/20 border border-white/30`}>
                  <Text style={tw`text-[8.5px] font-black uppercase text-white`}>Wishlist</Text>
                </View>
              </View>
              <Text style={tw`text-[10px] font-bold text-white/80 mt-0.5`}>
                Your favorite items saved for quick re-ordering
              </Text>
            </View>
          </View>

          {savedItems.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={tw`px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 flex-row items-center gap-1`}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={12} color="#FFFFFF" />
              <Text style={tw`text-[10.5px] font-black text-white`}>Clear</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* ── 2. Full-Screen Content Body ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            tw`p-4`,
            { paddingBottom: Math.max(insets.bottom, 16) + 40 },
          ]}
          style={tw`flex-1`}
        >
          {savedItems.length === 0 ? (
            <View style={tw`py-24 items-center justify-center`}>
              <View style={tw`w-24 h-24 rounded-full bg-rose-50 border border-rose-100 items-center justify-center mb-4 shadow-xs`}>
                <Ionicons name="heart-dislike-outline" size={44} color="#E11D48" />
              </View>
              <Text style={tw`text-base font-black text-slate-800 mb-1`}>
                No Saved Items Yet
              </Text>
              <Text style={tw`text-xs text-slate-400 text-center px-8 leading-4.5 max-w-sm`}>
                Browse your favorite groceries, snacks, fruits & dairy and tap the heart icon on any item to save them here!
              </Text>

              <TouchableOpacity
                onPress={onClose}
                style={tw`mt-6 px-6 py-3 bg-emerald-700 rounded-xl shadow-sm flex-row items-center gap-2`}
                activeOpacity={0.85}
              >
                <Ionicons name="bag-handle-outline" size={16} color="#FFFFFF" />
                <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
                  Start Exploring
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={tw`flex-row flex-wrap justify-between`}>
              {savedItems.map((product) => (
                <View key={product.id} style={{ width: '48.5%', marginBottom: 12 }}>
                  <ProductCard
                    product={product}
                    onPress={(p) => {
                      onClose();
                      onPressProduct && onPressProduct(p);
                    }}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};
