import React from 'react';
import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';
import { categories } from '../data/groceryData';
import tw from 'twrnc';

interface CategoryListProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  isSticky?: boolean;
}

// Custom premium pastel color system for categories when sticky
const CATEGORY_COLORS: Record<string, { bg: string; activeBg: string; text: string; activeText: string }> = {
  all: { bg: '#F3F4F6', activeBg: '#10B981', text: '#374151', activeText: '#FFFFFF' },
  fruits: { bg: '#FEF2F2', activeBg: '#EF4444', text: '#EF4444', activeText: '#FFFFFF' },
  vegetables: { bg: '#ECFDF5', activeBg: '#10B981', text: '#10B981', activeText: '#FFFFFF' },
  dairy: { bg: '#EFF6FF', activeBg: '#3B82F6', text: '#3B82F6', activeText: '#FFFFFF' },
  bakery: { bg: '#FFFBEB', activeBg: '#F59E0B', text: '#F59E0B', activeText: '#FFFFFF' },
  beverages: { bg: '#F5F3FF', activeBg: '#8B5CF6', text: '#8B5CF6', activeText: '#FFFFFF' },
  snacks: { bg: '#FFF7ED', activeBg: '#F97316', text: '#F97316', activeText: '#FFFFFF' },
};

export const CategoryList: React.FC<CategoryListProps> = ({
  selectedCategory,
  onSelectCategory,
  isSticky = false,
}) => {
  return (
    <View style={[tw`py-2`, { backgroundColor: isSticky ? theme.colors.cardBackground : 'transparent' }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-3 pb-1`}
      >
        {categories.map((category) => {
          const isSelected = category.id === selectedCategory;
          const colors = CATEGORY_COLORS[category.id] || CATEGORY_COLORS.all;
          
          // Glassmorphic style when floating in hero, pastel style when sticky at top
          const bgStyle = isSticky
            ? (isSelected ? colors.activeBg : colors.bg)
            : (isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.22)');
            
          const borderStyle = isSticky
            ? 'transparent'
            : (isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)');
            
          const textColor = isSticky
            ? (isSelected ? colors.activeText : colors.text)
            : (isSelected ? theme.colors.primaryDark || '#047857' : '#FFFFFF');

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                tw`items-center justify-center mx-1.5 py-2 px-3.5 rounded-2xl border min-w-[76px] shadow-sm`,
                { 
                  backgroundColor: bgStyle, 
                  borderColor: borderStyle,
                  shadowColor: isSelected && !isSticky ? '#000' : 'transparent',
                  elevation: isSelected ? 2 : 0,
                }
              ]}
              onPress={() => onSelectCategory(category.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  tw`w-10 h-10 rounded-full items-center justify-center mb-1 bg-white shadow-sm`,
                ]}
              >
                <Text style={tw`text-[18px]`}>{category.emoji}</Text>
              </View>
              <Text
                style={[
                  tw`text-[10px] font-black tracking-wider uppercase`,
                  { color: textColor }
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

