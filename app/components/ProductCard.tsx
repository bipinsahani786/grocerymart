import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Product } from '../data/groceryData';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, removeFromCart } = useCart();

  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <View style={styles.card}>
      {/* Favorite / Rating top row */}
      <View style={styles.topRow}>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color={theme.colors.accent} />
          <Text style={styles.ratingText}>{product.rating}</Text>
        </View>
        <TouchableOpacity style={styles.favButton}>
          <Ionicons name="heart-outline" size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Main product representation */}
      <View style={styles.imageContainer}>
        <Text style={styles.emoji}>{product.emoji}</Text>
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.weight}>{product.weight}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>

          {quantity > 0 ? (
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={() => removeFromCart(product.id)}
                style={styles.quantityBtn}
              >
                <Ionicons name="remove" size={14} color={theme.colors.primaryDark} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => addToCart(product)}
                style={styles.quantityBtn}
              >
                <Ionicons name="add" size={14} color={theme.colors.primaryDark} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => addToCart(product)}
              style={styles.addButton}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color={theme.colors.white} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flex: 1,
    margin: 6,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.accent,
    marginLeft: 2,
  },
  favButton: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  emoji: {
    fontSize: 54,
  },
  detailsContainer: {
    marginTop: 'auto',
  },
  weight: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  addButtonText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  quantityBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    paddingHorizontal: 4,
  },
});
