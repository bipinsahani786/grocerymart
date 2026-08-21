import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

export type ViewMode = 'grid' | 'list';
export type ActiveFilter = 'all' | 'under99' | 'high_rated' | 'price_low';

interface SearchFilterBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  viewMode,
  onViewModeChange,
  activeFilter,
  onFilterChange,
}) => {
  return (
    <View style={tw`bg-white px-3 py-2 border-b border-slate-200/70 shadow-sm z-20`}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tw`items-center gap-2`}>
        {/* View Mode Switcher: 4-Card Grid vs List View */}
        <View style={tw`flex-row bg-slate-100 p-0.5 rounded-md mr-1`}>
          <TouchableOpacity
            onPress={() => onViewModeChange('grid')}
            style={[
              tw`px-2.5 py-1.5 rounded-sm flex-row items-center gap-1.5`,
              viewMode === 'grid' ? tw`bg-white shadow-sm` : tw`bg-transparent`,
            ]}
            activeOpacity={0.8}
          >
            <Ionicons name="grid" size={12} color={viewMode === 'grid' ? '#059669' : '#64748B'} />
            <Text style={[tw`text-[10px] font-black`, viewMode === 'grid' ? tw`text-emerald-800` : tw`text-slate-600`]}>
              4-Grid
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onViewModeChange('list')}
            style={[
              tw`px-2.5 py-1.5 rounded-sm flex-row items-center gap-1.5`,
              viewMode === 'list' ? tw`bg-white shadow-sm` : tw`bg-transparent`,
            ]}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={13} color={viewMode === 'list' ? '#059669' : '#64748B'} />
            <Text style={[tw`text-[10px] font-black`, viewMode === 'list' ? tw`text-emerald-800` : tw`text-slate-600`]}>
              List View
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <TouchableOpacity
          onPress={() => onFilterChange(activeFilter === 'all' ? 'under99' : 'all')}
          style={[
            tw`px-3 py-1.5 rounded-md border`,
            activeFilter === 'under99' ? tw`bg-emerald-50 border-emerald-600` : tw`bg-white border-slate-200`,
          ]}
        >
          <Text style={[tw`text-[10px] font-black`, activeFilter === 'under99' ? tw`text-emerald-800` : tw`text-slate-700`]}>
            Under ₹99
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onFilterChange(activeFilter === 'price_low' ? 'all' : 'price_low')}
          style={[
            tw`px-3 py-1.5 rounded-md border`,
            activeFilter === 'price_low' ? tw`bg-emerald-50 border-emerald-600` : tw`bg-white border-slate-200`,
          ]}
        >
          <Text style={[tw`text-[10px] font-black`, activeFilter === 'price_low' ? tw`text-emerald-800` : tw`text-slate-700`]}>
            Price: Low to High
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onFilterChange(activeFilter === 'high_rated' ? 'all' : 'high_rated')}
          style={[
            tw`px-3 py-1.5 rounded-md border flex-row items-center gap-1`,
            activeFilter === 'high_rated' ? tw`bg-emerald-50 border-emerald-600` : tw`bg-white border-slate-200`,
          ]}
        >
          <Ionicons name="star" size={10} color={activeFilter === 'high_rated' ? '#059669' : '#F59E0B'} />
          <Text style={[tw`text-[10px] font-black`, activeFilter === 'high_rated' ? tw`text-emerald-800` : tw`text-slate-700`]}>
            Rating 4.5+
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
