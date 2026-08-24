import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

export type TripFilter = 'ALL' | 'TODAY' | 'COMPLETED' | 'COD';

interface OrderFilterTabsProps {
  selectedFilter: TripFilter;
  onSelect: (filter: TripFilter) => void;
}

export const OrderFilterTabs: React.FC<OrderFilterTabsProps> = ({ selectedFilter, onSelect }) => {
  const filters: { id: TripFilter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'All Trips', count: 18 },
    { id: 'TODAY', label: 'Today', count: 14 },
    { id: 'COMPLETED', label: 'Delivered', count: 17 },
    { id: 'COD', label: 'Cash (COD)', count: 3 },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={tw`gap-2 py-1`}
      style={tw`mb-3`}
    >
      {filters.map((f) => {
        const isSelected = selectedFilter === f.id;
        return (
          <TouchableOpacity
            key={f.id}
            activeOpacity={0.8}
            onPress={() => onSelect(f.id)}
            style={[
              tw`flex-row items-center px-3.5 py-1.5 rounded-full border`,
              isSelected
                ? { backgroundColor: '#047857', borderColor: '#047857' }
                : { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
            ]}
          >
            <Text
              style={[
                tw`text-xs`,
                {
                  color: isSelected ? '#FFFFFF' : '#475569',
                  fontWeight: isSelected ? '800' : '600',
                },
              ]}
            >
              {f.label}
            </Text>
            {f.count !== undefined && (
              <View
                style={[
                  tw`ml-1.5 px-1.5 py-0.2 rounded-full`,
                  isSelected ? tw`bg-emerald-800` : tw`bg-slate-200`,
                ]}
              >
                <Text
                  style={[
                    tw`text-[10px] font-black`,
                    { color: isSelected ? '#34D399' : '#64748B' },
                  ]}
                >
                  {f.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

