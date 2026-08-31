import { TextStyle } from 'react-native';

export const Typography: { [key: string]: TextStyle } = {
  // Compact, normalized numbers
  amountLarge: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  amountMedium: {
    fontSize: 13,
    fontWeight: '700',
    includeFontPadding: false,
  },
  // Section Titles
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.1,
    includeFontPadding: false,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    includeFontPadding: false,
  },
  // Stat numbers & labels
  statNumber: {
    fontSize: 12,
    fontWeight: '800',
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    includeFontPadding: false,
  },
  // Body text
  body: {
    fontSize: 11,
    fontWeight: '500',
    includeFontPadding: false,
  },
  bodyBold: {
    fontSize: 11,
    fontWeight: '700',
    includeFontPadding: false,
  },
  // Subtext & Badges
  caption: {
    fontSize: 10,
    fontWeight: '500',
    includeFontPadding: false,
  },
  badge: {
    fontSize: 9,
    fontWeight: '800',
    includeFontPadding: false,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '700',
    includeFontPadding: false,
  },
};
