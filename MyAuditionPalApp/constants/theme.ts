/**
 * MyAuditionPal color palette — a clean, high-contrast scheme with bright-pink accents.
 *   Light: light-gray backdrop, white cards, black text, pink accents.
 *   Dark:  black backdrop, gray cards, white text, pink accents.
 *
 * This `Colors` object is the single source of truth for color. The themed components
 * (ThemedView, ThemedText), the tab bar, and every screen read from it, so changing a
 * value here recolors the whole app. Each key exists in BOTH `light` and `dark`.
 *
 * Key meanings:
 * - text             : main text color (black in light, white in dark)
 * - background       : the base screen color (gray in light, black in dark)
 * - surface          : cards / raised areas (white in light, gray in dark)
 * - tint             : the active accent (selected tab & primary actions) — bright pink
 * - primary          : bright pink — main accent / buttons / badges
 * - secondary        : pink — highlights / pressed states / heart
 * - deadline         : warm alert color for time-sensitive warnings
 * - border           : hairline color for dividers / card edges
 * - muted            : low-emphasis text (captions, hints, section headers)
 * - icon / tabIcon*  : icon colors
 */

import { Platform } from 'react-native';

const tintColorLight = '#EC4899'; // bright pink
const tintColorDark = '#EC4899';

export const Colors = {
  light: {
    text: '#111111',
    background: '#F4F4F6',
    surface: '#FFFFFF',
    tint: tintColorLight,
    primary: '#EC4899',
    secondary: '#DB2777',
    deadline: '#E0584A',
    success: '#2FA36B',
    border: '#E2E2E6',
    muted: '#6E6E73',
    icon: '#6E6E73',
    tabIconDefault: '#9A9A9E',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#000000',
    surface: '#2C2C2E',
    tint: tintColorDark,
    primary: '#EC4899',
    secondary: '#F472B6',
    deadline: '#F08A7A',
    success: '#4FC58C',
    border: '#3A3A3C',
    muted: '#AEAEB2',
    icon: '#AEAEB2',
    tabIconDefault: '#7A7A7E',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
