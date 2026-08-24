import React from 'react';
import { Text, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../constants/theme';

export type TripFilter = 'ALL' | 'TODAY' | 'COMPLETED' | 'COD';

interface OrderFilterTabsProps {
  selectedFilter: TripFilter;
  onSelect: (filter: TripFilter) => void;
}

export const OrderFilterTabs: React.FC<OrderFilterTabsProps> = ({ selectedFilter, onSelect }) => {
  const filters: { id: TripFilter; label: string }[] = [
    { id: 'ALL', label: 'All Trips' },
    { id: 'TODAY', label: 'Today (14)' },
    { id: 'COMPLETED', label: 'Delivered' },
    { id: 'COD', label: 'Cash on Delivery' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
      style={{ marginBottom: 12 }}
    >
      {filters.map((f) => {
        const isSelected = selectedFilter === f.id;
        return (
          <TouchableOpacity
            key={f.id}
            onPress={() => onSelect(f.id)}
            style={{
              backgroundColor: isSelected ? Colors.primary : Colors.surfaceCard,
              borderColor: isSelected ? Colors.primary : Colors.border,
              borderWidth: 1,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: isSelected ? '800' : '600',
                color: isSelected ? Colors.textDark : Colors.textSecondary,
              }}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
