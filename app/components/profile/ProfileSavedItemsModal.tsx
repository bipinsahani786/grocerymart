import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const { savedItems, clearSavedItems } = useSavedItems();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 bg-black/60 justify-end`}>
        {/* Backdrop dismissable area */}
        <TouchableOpacity
          style={tw`absolute inset-0`}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Sheet Container */}
        <View
          style={[
            tw`bg-white rounded-t-[36px] w-full max-h-[88%] flex-col overflow-hidden shadow-2xl`,
            Platform.OS === 'ios' ? { paddingBottom: 24 } : null,
          ]}
        >
          {/* Header Bar */}
          <View style={tw`px-6 py-4 border-b border-slate-100 flex-row justify-between items-center bg-white`}>
            <View>
              <View style={tw`flex-row items-center gap-2`}>
                <Ionicons name="heart" size={20} color="#E11D48" />
                <Text style={tw`text-base font-black text-slate-800`}>
                  Saved Groceries ({savedItems.length})
                </Text>
              </View>
              <Text style={tw`text-[10px] font-bold text-slate-400 mt-0.5`}>
                Your favorite items saved for quick re-ordering
              </Text>
            </View>

            <View style={tw`flex-row items-center gap-2`}>
              {savedItems.length > 0 && (
                <TouchableOpacity
                  onPress={clearSavedItems}
                  style={tw`px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200`}
                >
                  <Text style={tw`text-[10px] font-bold text-slate-600`}>Clear All</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                style={tw`w-9 h-9 rounded-full bg-slate-100 justify-center items-center`}
              >
                <Ionicons name="close" size={18} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`p-4 pb-20`}
          >
            {savedItems.length === 0 ? (
              <View style={tw`py-16 items-center justify-center`}>
                <View style={tw`w-20 h-20 rounded-full bg-rose-50 border border-rose-100 items-center justify-center mb-4`}>
                  <Ionicons name="heart-dislike-outline" size={36} color="#E11D48" />
                </View>
                <Text style={tw`text-base font-black text-slate-800 mb-1`}>
                  No Saved Items Yet
                </Text>
                <Text style={tw`text-xs text-slate-400 text-center px-8 leading-4`}>
                  Browse your favorite fruits, veggies, dairy & snacks and tap the heart icon to save them here!
                </Text>
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
      </View>
    </Modal>
  );
};
