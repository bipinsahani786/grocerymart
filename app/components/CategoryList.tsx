import React from 'react';
import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';
import { categories } from '../data/groceryData';
import tw from 'twrnc';

interface CategoryListProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={[tw`py-3`, { backgroundColor: theme.colors.cardBackground }]}>
      <View style={tw`px-4 mb-2`}>
        <Text style={[tw`text-lg font-black`, { color: theme.colors.text }]}>Shop by Category</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-3 pb-1`}
      >
        {categories.map((category) => {
          const isSelected = category.id === selectedCategory;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                tw`items-center justify-center mx-1 py-2 px-3 rounded-xl border min-w-[80px]`,
                { 
                  backgroundColor: theme.colors.background, 
                  borderColor: theme.colors.border 
                },
                isSelected && {
                  backgroundColor: theme.colors.primaryLight,
                  borderColor: theme.colors.primary,
                }
              ]}
              onPress={() => onSelectCategory(category.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  tw`w-12 h-12 rounded-full items-center justify-center mb-1 shadow-sm`,
                  { 
                    backgroundColor: theme.colors.white, 
                    shadowColor: theme.colors.shadow, 
                    elevation: 1 
                  }
                ]}
              >
                <Text style={tw`text-[22px]`}>{category.emoji}</Text>
              </View>
              <Text
                style={[
                  tw`text-[12px] font-semibold`,
                  { color: theme.colors.textLight },
                  isSelected && [tw`font-bold`, { color: theme.colors.primaryDark }]
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
