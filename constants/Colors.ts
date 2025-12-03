/**
 * Theme colors based on Tweakcn design system
 * Converted from OKLCH to hex/RGB for React Native compatibility
 * Maintains consistent light/dark mode theming across the app
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    // Legacy compatibility
    text: '#3d3d3d',
    background: '#d8d8d8',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    // Tweakcn theme colors (light mode)
    // Primary brand colors - Orange
    primary: '#d97706',           // oklch(0.5016 0.1887 27.4816)
    primaryForeground: '#ffffff', // oklch(1.0000 0 0)

    // Secondary colors - Green
    secondary: '#059669',          // oklch(0.4955 0.0896 126.1858)
    secondaryForeground: '#ffffff', // oklch(1.0000 0 0)

    // Accent colors - Purple
    accent: '#7c3aed',             // oklch(0.5880 0.0993 245.7394)
    accentForeground: '#ffffff',   // oklch(1.0000 0 0)

    // Destructive/Error - Yellow/Orange
    destructive: '#ea580c',        // oklch(0.7076 0.1975 46.4558)
    destructiveForeground: '#000000', // oklch(0 0 0)

    // Backgrounds
    backgroundPrimary: '#d8d8d8',     // oklch(0.8452 0 0)
    backgroundSecondary: '#c1c1c1',   // oklch(0.7572 0 0) - card

    // Text colors
    foreground: '#3d3d3d',         // oklch(0.2393 0 0)
    textSecondary: '#686868',      // oklch(0.4091 0 0) - muted-foreground
    textTertiary: '#9ca3af',

    // Muted colors
    muted: '#c8c8c8',              // oklch(0.7826 0 0)
    mutedForeground: '#686868',    // oklch(0.4091 0 0)

    // Border and input
    border: '#6b6b6b',             // oklch(0.4313 0 0)
    input: '#6b6b6b',              // oklch(0.4313 0 0)
    ring: '#d97706',               // same as primary

    // Interactive elements
    cardBackground: '#c1c1c1',     // oklch(0.7572 0 0)
    cardForeground: '#3d3d3d',     // oklch(0.2393 0 0)
    popover: '#c1c1c1',            // oklch(0.7572 0 0)
    popoverForeground: '#3d3d3d',  // oklch(0.2393 0 0)

    // Status colors (for compatibility)
    success: '#059669',
    error: '#ea580c',
    warning: '#f59e0b',
    info: '#3b82f6',

    buttonText: '#ffffff',
  },

  dark: {
    // Legacy compatibility
    text: '#e8e8e8',
    background: '#383838',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    // Tweakcn theme colors (dark mode)
    // Primary brand colors - Orange (brighter in dark mode)
    primary: '#f97316',            // oklch(0.6083 0.2090 27.0276)
    primaryForeground: '#ffffff',  // oklch(1.0000 0 0)

    // Secondary colors - Green (brighter in dark mode)
    secondary: '#10b981',          // oklch(0.6423 0.1467 133.0145)
    secondaryForeground: '#000000', // oklch(0 0 0)

    // Accent colors - Purple (brighter in dark mode)
    accent: '#a78bfa',             // oklch(0.7482 0.1235 244.7492)
    accentForeground: '#000000',   // oklch(0 0 0)

    // Destructive/Error - Yellow (brighter in dark mode)
    destructive: '#fbbf24',        // oklch(0.7839 0.1719 68.0943)
    destructiveForeground: '#000000', // oklch(0 0 0)

    // Backgrounds
    backgroundPrimary: '#383838',     // oklch(0.2178 0 0)
    backgroundSecondary: '#494949',   // oklch(0.2850 0 0) - card

    // Text colors
    foreground: '#e8e8e8',         // oklch(0.9067 0 0)
    textSecondary: '#b4b4b4',      // oklch(0.7058 0 0) - muted-foreground
    textTertiary: '#9ca3af',

    // Muted colors
    muted: '#434343',              // oklch(0.2645 0 0)
    mutedForeground: '#b4b4b4',    // oklch(0.7058 0 0)

    // Border and input
    border: '#686868',             // oklch(0.4091 0 0)
    input: '#686868',              // oklch(0.4091 0 0)
    ring: '#f97316',               // same as primary

    // Interactive elements
    cardBackground: '#494949',     // oklch(0.2850 0 0)
    cardForeground: '#e8e8e8',     // oklch(0.9067 0 0)
    popover: '#494949',            // oklch(0.2850 0 0)
    popoverForeground: '#e8e8e8',  // oklch(0.9067 0 0)

    // Status colors (for compatibility)
    success: '#10b981',
    error: '#fbbf24',
    warning: '#f59e0b',
    info: '#3b82f6',

    buttonText: '#ffffff',
  },
};

/**
 * Get colors for the current theme
 * @param colorScheme - 'light' or 'dark'
 */
export function getThemeColors(colorScheme: 'light' | 'dark' | null | undefined) {
  return Colors[colorScheme === 'dark' ? 'dark' : 'light'];
}

/**
 * Common spacing values (based on Tweakcn --spacing: 0.25rem = 4px)
 */
export const Spacing = {
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem
  md: 16,   // 1rem
  lg: 24,   // 1.5rem
  xl: 32,   // 2rem
  xxl: 48,  // 3rem
};

/**
 * Common border radius values (Tweakcn uses --radius: 0px, but we'll keep some for flexibility)
 */
export const BorderRadius = {
  none: 0,   // Tweakcn default
  sm: 2,     // calc(0px - 4px) - minimal
  md: 4,     // calc(0px - 2px) - minimal
  lg: 6,     // 0px base - minimal
  xl: 8,     // calc(0px + 4px) - minimal
  full: 9999,
};

/**
 * Common font sizes
 */
export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/**
 * Shadow styles based on Tweakcn theme
 * Light mode: lower opacity (0.2-0.4)
 * Dark mode: higher opacity (0.3-0.6)
 */
export const Shadows = {
  light: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 6,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    },
  },
  dark: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 2,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 5,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 5,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 6,
      elevation: 6,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 10,
      elevation: 8,
    },
  },
};

/**
 * Get shadows for the current theme
 * @param colorScheme - 'light' or 'dark'
 */
export function getThemeShadows(colorScheme: 'light' | 'dark' | null | undefined) {
  return Shadows[colorScheme === 'dark' ? 'dark' : 'light'];
}
