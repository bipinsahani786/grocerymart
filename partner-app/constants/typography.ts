import { TextStyle } from 'react-native';

export const Typography: { [key: string]: TextStyle } = {

  // Amounts & Numbers (Hero Elements)
  amountLarge: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    includeFontPadding: false,
  },
  amountMedium: {
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
  },

  // Headings & Section Titles
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
    includeFontPadding: false,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    includeFontPadding: false,
  },

  // Stat Numbers & Labels
  statNumber: {
    fontSize: 14,
    fontWeight: '700',
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    includeFontPadding: false,
  },

  // Body Text (Regular / Medium / Bold)
  body: {
    fontSize: 12,
    fontWeight: '400',
    includeFontPadding: false,
  },
  bodyMedium: {
    fontSize: 12,
    fontWeight: '500',
    includeFontPadding: false,
  },
  bodyBold: {
    fontSize: 12,
    fontWeight: '600',
    includeFontPadding: false,
  },

  // Captions, Subtext & Badges
  caption: {
    fontSize: 10.5,
    fontWeight: '400',
    includeFontPadding: false,
  },
  captionItalic: {
    fontSize: 10.5,
    fontWeight: '400',
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  badge: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
    includeFontPadding: false,
  },

  // Buttons & Controls
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    includeFontPadding: false,
  },
};

