/**
 * Color utilities for easy access to the color palette
 */

import { Colors } from '@/constants/Colors';

// Type definitions
export type ColorIntensity = '100' | '300' | '500' | '700' | '900';
export type ColorName = 'primary' | 'warning' | 'error' | 'white' | 'black';
export type ColorScheme = 'light' | 'dark';

/**
 * Get a specific color variant
 * @param scheme - The color scheme (light/dark)
 * @param colorName - The color name
 * @param intensity - The color intensity (100-900)
 * @returns The hex color value
 */
export function getColor(
  scheme: ColorScheme,
  colorName: ColorName,
  intensity: ColorIntensity = '500'
): string {
  const colors = Colors[scheme];
  return (colors[colorName] as { [key: string]: string })[intensity];
}

/**
 * Get semantic colors (text, background, etc.)
 * @param scheme - The color scheme (light/dark)
 * @param semanticName - The semantic color name
 * @returns The hex color value
 */
export function getSemanticColor(
  scheme: ColorScheme,
  semanticName: 'text' | 'background' | 'surface' | 'tint' | 'icon' | 'tabIconDefault' | 'tabIconSelected' | 'border' | 'placeholder'
): string {
  return Colors[scheme][semanticName] as string;
}

/**
 * Color palette object for easy access in components
 */
export const ColorPalette = {
  light: {
    primary: Colors.light.primary,
    warning: Colors.light.warning,
    error: Colors.light.error,
    white: Colors.light.white,
    black: Colors.light.black,
  },
  dark: {
    primary: Colors.dark.primary,
    warning: Colors.dark.warning,
    error: Colors.dark.error,
    white: Colors.dark.white,
    black: Colors.dark.black,
  },
};

/**
 * Common color combinations for consistent UI
 */
export const ColorCombinations = {
  light: {
    primaryButton: {
      background: Colors.light.primary['500'],
      text: Colors.light.white['500'],
      border: Colors.light.primary['700'],
    },
    warningButton: {
      background: Colors.light.warning['500'],
      text: Colors.light.white['500'],
      border: Colors.light.warning['700'],
    },
    errorButton: {
      background: Colors.light.error['500'],
      text: Colors.light.white['500'],
      border: Colors.light.error['700'],
    },
    card: {
      background: Colors.light.white['500'],
      text: Colors.light.black['700'],
      border: Colors.light.black['100'],
    },
  },
  dark: {
    primaryButton: {
      background: Colors.dark.primary['500'],
      text: Colors.dark.black['500'],
      border: Colors.dark.primary['700'],
    },
    warningButton: {
      background: Colors.dark.warning['500'],
      text: Colors.dark.black['500'],
      border: Colors.dark.warning['700'],
    },
    errorButton: {
      background: Colors.dark.error['500'],
      text: Colors.dark.white['500'],
      border: Colors.dark.error['700'],
    },
    card: {
      background: Colors.dark.black['300'],
      text: Colors.dark.white['700'],
      border: Colors.dark.white['100'],
    },
  },
};
