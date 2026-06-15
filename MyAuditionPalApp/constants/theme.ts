/**
 * MyAuditionPal color palette — a calm, soothing scheme of pinks, beiges, and warm whites.
 * Auditioning is stressful; the app should feel like a reassuring companion.
 *
 * This `Colors` object is the single source of truth for color. The themed components
 * (ThemedView, ThemedText) and the tab bar read from it, so changing a value here
 * recolors the whole app. Each key exists in BOTH `light` and `dark` so screens can
 * read the right one for the user's system setting.
 *
 * Key meanings:
 * - text             : main text color (soft charcoal-brown, never harsh black)
 * - background       : the base screen color (warm off-white)
 * - surface          : cards / raised areas (pale beige)
 * - tint             : the active accent (used for the selected tab & primary actions)
 * - primary          : muted dusty pink — main accent / buttons
 * - secondary        : deeper dusty pink — highlights / pressed states
 * - deadline         : gentle dusty terracotta for time-sensitive warnings (never alarming red)
 * - border           : soft hairline color for dividers / card edges
 * - muted            : low-emphasis text (captions, hints)
 * - icon / tabIcon*  : icon colors, kept consistent with the palette
 */

import { Platform } from 'react-native';

const tintColorLight = '#C98A8A'; // deeper dusty pink
const tintColorDark = '#E8B4B8'; // dusty pink, reads well on dark

export const Colors = {
  light: {
    text: '#4A3F3A',
    background: '#FDFBF7',
    surface: '#F3E9DD',
    tint: tintColorLight,
    primary: '#E8B4B8',
    secondary: '#C98A8A',
    deadline: '#C97B63',
    border: '#EADFD3',
    muted: '#8A7D76',
    icon: '#9C8E86',
    tabIconDefault: '#C9BBB1',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F3E9DD',
    background: '#1E1A19',
    surface: '#2A2422',
    tint: tintColorDark,
    primary: '#E8B4B8',
    secondary: '#D9A5A0',
    deadline: '#D88E73',
    border: '#3A322E',
    muted: '#B9A89E',
    icon: '#B9A89E',
    tabIconDefault: '#7A6D65',
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
