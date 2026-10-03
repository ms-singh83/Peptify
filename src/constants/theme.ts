/**
 * Design tokens — see docs/DESIGN.md. Screens must use these, never raw hex values.
 */
import { Platform, type TextStyle } from 'react-native';

export const Colors = {
  light: {
    primary: '#0B7A6B',
    primaryMuted: '#E6F6F3',
    onPrimary: '#FFFFFF',
    background: '#FFFFFF',
    surface: '#F4F5F7',
    border: '#E3E5E8',
    text: '#0B0D0E',
    textSecondary: '#60646C',
    success: '#15803D',
    warning: '#B45309',
    danger: '#B91C1C',
    pro: '#7C3AED',
    overlay: 'rgba(0,0,0,0.35)',
  },
  dark: {
    primary: '#2DD4BF',
    primaryMuted: '#0B2E2A',
    onPrimary: '#04201C',
    background: '#000000',
    surface: '#16181B',
    border: '#2A2D31',
    text: '#F5F7F8',
    textSecondary: '#A1A6AD',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    pro: '#A78BFA',
    overlay: 'rgba(0,0,0,0.6)',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };
export type ThemeColor = keyof ThemeColors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  pill: 999,
} as const;

export const Type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  callout: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
} as const;

export type TypeVariant = keyof typeof Type;

/** Tabular digits so numbers don't jump while typing. */
export const TabularNums: TextStyle = { fontVariant: ['tabular-nums'] };

export const MinTapTarget = 44;
export const MaxContentWidth = 640;

export const MonoFont = Platform.select({ ios: 'Menlo', default: 'monospace' });
