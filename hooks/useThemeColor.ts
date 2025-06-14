/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// Type for color intensity variants
type ColorIntensity = '100' | '300' | '500' | '700' | '900';

// Type for color names with variants
type ColorName = 'primary' | 'warning' | 'error' | 'white' | 'black';

// Type for semantic color names
type SemanticColorName = 'text' | 'background' | 'surface' | 'tint' | 'icon' | 'tabIconDefault' | 'tabIconSelected' | 'border' | 'placeholder';

// Combined type for all available colors
type AvailableColors = SemanticColorName | ColorName;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: AvailableColors,
  intensity?: ColorIntensity
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    const colors = Colors[theme];
    
    // If intensity is provided and the color supports variants
    if (intensity && colorName in colors && typeof colors[colorName as ColorName] === 'object') {
      return (colors[colorName as ColorName] as {[key: string]: string})[intensity];
    }
    
    // For semantic colors or when no intensity is specified
    return colors[colorName as keyof typeof colors] as string;
  }
}

// Convenience hook for getting color variants
export function useColorVariant(colorName: ColorName, intensity: ColorIntensity = '500') {
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  return (colors[colorName] as {[key: string]: string})[intensity];
}

// Convenience hooks for specific color types
export function usePrimaryColor(intensity: ColorIntensity = '500') {
  return useColorVariant('primary', intensity);
}

export function useWarningColor(intensity: ColorIntensity = '500') {
  return useColorVariant('warning', intensity);
}

export function useErrorColor(intensity: ColorIntensity = '500') {
  return useColorVariant('error', intensity);
}
