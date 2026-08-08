import React from 'react';
import { StyleSheet, Text, ScrollView, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';
import { categories } from '../data/groceryData';

interface CategoryListProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = category.id === selectedCategory;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                isSelected && styles.selectedCard,
              ]}
              onPress={() => onSelectCategory(category.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.emojiContainer,
                  isSelected && styles.selectedEmojiContainer,
                ]}
              >
                <Text style={styles.emojiText}>{category.emoji}</Text>
              </View>
              <Text
                style={[
                  styles.categoryName,
                  isSelected && styles.selectedCategoryName,
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

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg - 4,
    paddingBottom: theme.spacing.xs,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 80,
  },
  selectedCard: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedEmojiContainer: {
    backgroundColor: theme.colors.white,
  },
  emojiText: {
    fontSize: 22,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textLight,
  },
  selectedCategoryName: {
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
});
