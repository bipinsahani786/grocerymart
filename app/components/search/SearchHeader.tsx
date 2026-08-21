import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { SearchBar } from '../SearchBar';
import tw from 'twrnc';

interface SearchHeaderProps {
  onBack: () => void;
  searchQuery: string;
  onSearchQueryChange: (text: string) => void;
  onSubmitSearch: (query: string) => void;
  onClear: () => void;
  searchInputRef: React.RefObject<TextInput | null>;
  resultCount: number;
  hasSubmittedQuery: boolean;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onBack,
  searchQuery,
  onSearchQueryChange,
  onSubmitSearch,
  onClear,
  searchInputRef,
  resultCount,
  hasSubmittedQuery,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark || '#047857']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        tw`px-4 pb-3 shadow-sm z-30`,
        { paddingTop: Math.max(insets.top, 14) + 6 },
      ]}
    >
      <View style={tw`flex-row items-center gap-2.5`}>
        <TouchableOpacity
          onPress={onBack}
          style={tw`w-10 h-10 rounded-md bg-white/20 border border-white/30 justify-center items-center`}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={tw`flex-1`}>
          <SearchBar
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            onSubmitSearch={onSubmitSearch}
            onClear={onClear}
            inputRef={searchInputRef}
            customPlaceholder="Search milk, fruits, atta, bread..."
          />
        </View>
      </View>

      {/* ETA Strip with white/emerald contrast on matching gradient header */}
      <View style={tw`flex-row items-center justify-between mt-2.5 pt-2 border-t border-white/20`}>
        <View style={tw`flex-row items-center gap-1.5`}>
          <View style={tw`w-5 h-5 rounded-md bg-white/20 items-center justify-center border border-white/30`}>
            <Ionicons name="flash" size={11} color="#FBBF24" />
          </View>
          <Text style={tw`text-[11px] font-black text-white`}>
            Delivery in <Text style={tw`text-emerald-100 font-black`}>10-15 mins</Text>
          </Text>
        </View>

        {hasSubmittedQuery && (
          <Text style={tw`text-[10.5px] font-bold text-white/90`}>
            {resultCount} items found
          </Text>
        )}
      </View>
    </LinearGradient>
  );
};
