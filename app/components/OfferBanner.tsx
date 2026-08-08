import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { offers } from '../data/groceryData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export const OfferBanner: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {offers.map((offer) => (
          <TouchableOpacity key={offer.id} activeOpacity={0.95}>
            <LinearGradient
              colors={offer.gradientColors as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerCard}
            >
              <View style={styles.textContainer}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{offer.discount}</Text>
                </View>
                <Text style={styles.title}>{offer.title}</Text>
                <Text style={styles.subTitle}>{offer.subTitle}</Text>
                <TouchableOpacity style={styles.shopNowButton}>
                  <Text style={styles.shopNowText}>Shop Now</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.emojiContainer}>
                <Text style={styles.emojiText}>{offer.emoji}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.cardBackground,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  bannerCard: {
    width: CARD_WIDTH,
    height: 150,
    borderRadius: theme.borderRadius.lg,
    marginRight: 16,
    flexDirection: 'row',
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1.3,
    justifyContent: 'center',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.xs,
    marginBottom: theme.spacing.xs,
  },
  badgeText: {
    color: theme.colors.white,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.white,
    lineHeight: 24,
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.md,
  },
  shopNowButton: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  shopNowText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  emojiContainer: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 70,
    opacity: 0.9,
  },
});
