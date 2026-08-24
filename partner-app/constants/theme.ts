export const Colors = {
  // Brand & Background (Matching GroceryMart Main App)
  background: '#F9FAFB', // Clean light off-white background
  surface: '#FFFFFF', // Crisp White Card / Container
  surfaceLight: '#F3F4F6', // Soft Light Gray Container / Pills
  surfaceCard: '#FFFFFF', // Clean White Card Background
  border: '#E5E7EB', // Line border
  borderLight: '#F3F4F6', // Extra soft border

  // Primary Statuses (GroceryMart Emerald)
  primary: '#10B981', // Emerald green
  primaryDark: '#047857',
  primaryLight: '#059669',
  primaryBg: '#D1FAE5',
  primaryGlow: 'rgba(16, 185, 129, 0.2)',

  // Secondary Accents
  amber: '#F59E0B', // Amber gold
  amberDark: '#D97706',
  amberLight: '#FEF3C7',
  amberGlow: 'rgba(245, 158, 11, 0.2)',

  blue: '#2563EB',
  blueDark: '#1D4ED8',
  blueLight: '#DBEAFE',
  blueGlow: 'rgba(37, 99, 235, 0.2)',

  danger: '#EF4444',
  dangerDark: '#DC2626',
  dangerLight: '#FEE2E2',
  dangerGlow: 'rgba(239, 68, 68, 0.2)',

  purple: '#7C3AED',
  purpleDark: '#6D28D9',
  purpleLight: '#EDE9FE',

  // Text
  text: '#111827', // Dark slate
  textSecondary: '#4B5563', // Gray text
  textMuted: '#9CA3AF', // Light gray
  textDark: '#111827',
  textWhite: '#FFFFFF',

  // System
  white: '#FFFFFF',
  black: '#000000',
  offline: '#6B7280',
  offlineBg: '#E5E7EB',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Splash Screen specific
  splashGradientStart: '#0f9b0f',
  splashGradientEnd: '#004d26',
  splashTextShadow: 'rgba(0, 0, 0, 0.2)',
  stripeColor: '#ffffff',
};

export const theme = {
  colors: Colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
};

export const Shadows = {
  sm: {
    shadowColor: Colors.textMuted,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.textMuted,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.textMuted,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryGlow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  amberGlow: {
    shadowColor: Colors.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
};
