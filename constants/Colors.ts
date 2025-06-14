/**
 * Color system for the app with intensity variants and automatic dark mode generation.
 * Base colors: primary (#0099D5), warning (#FF9F1C), error (#BF211E), white (#EBFBFC), black (#191919)
 * Each color has variants: 100 (lightest), 300, 500 (base), 700, 900 (darkest)
 */

// Helper functions for color manipulation
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generateColorVariants(baseColor: string): {[key: string]: string} {
  const [h, s, l] = hexToHsl(baseColor);
  
  return {
    100: hslToHex(h, s, Math.min(95, l + 40)),
    300: hslToHex(h, s, Math.min(85, l + 20)),
    500: baseColor, // Base color
    700: hslToHex(h, s, Math.max(15, l - 20)),
    900: hslToHex(h, s, Math.max(5, l - 40)),
  };
}

function generateDarkModeVariants(baseColor: string): {[key: string]: string} {
  const [h, s, l] = hexToHsl(baseColor);
  
  // For dark mode, we invert the lightness logic and adjust saturation
  const adjustedS = Math.max(20, s - 10); // Slightly desaturated for dark mode
  
  return {
    100: hslToHex(h, adjustedS, Math.max(10, l - 30)),
    300: hslToHex(h, adjustedS, Math.max(20, l - 15)),
    500: hslToHex(h, adjustedS, Math.min(80, l + 10)), // Slightly lighter base for dark mode
    700: hslToHex(h, adjustedS, Math.min(90, l + 25)),
    900: hslToHex(h, adjustedS, Math.min(95, l + 40)),
  };
}

// Base color definitions
const BASE_COLORS = {
  primary: '#0099D5',
  warning: '#FF9F1C',
  error: '#BF211E',
  white: '#EBFBFC',
  black: '#191919',
};

// Generate light mode color variants
const lightColors = {
  primary: generateColorVariants(BASE_COLORS.primary),
  warning: generateColorVariants(BASE_COLORS.warning),
  error: generateColorVariants(BASE_COLORS.error),
  white: generateColorVariants(BASE_COLORS.white),
  black: generateColorVariants(BASE_COLORS.black),
};

// Generate dark mode color variants
const darkColors = {
  primary: generateDarkModeVariants(BASE_COLORS.primary),
  warning: generateDarkModeVariants(BASE_COLORS.warning),
  error: generateDarkModeVariants(BASE_COLORS.error),
  white: generateDarkModeVariants(BASE_COLORS.white),
  black: generateDarkModeVariants(BASE_COLORS.black),
};

export const Colors = {
  light: {
    // New color system
    ...lightColors,
    
    // Semantic colors using the new palette
    text: lightColors.black[700],
    background: lightColors.white[500],
    surface: lightColors.white[300],
    tint: lightColors.primary[500],
    icon: lightColors.black[300],
    tabIconDefault: lightColors.black[300],
    tabIconSelected: lightColors.primary[500],
    border: lightColors.black[100],
    placeholder: lightColors.black[300],
  },
  dark: {
    // New color system
    ...darkColors,
    
    // Semantic colors using the new palette (inverted logic)
    text: darkColors.white[700],
    background: darkColors.black[500],
    surface: darkColors.black[300],
    tint: darkColors.primary[500],
    icon: darkColors.white[300],
    tabIconDefault: darkColors.white[300],
    tabIconSelected: darkColors.primary[500],
    border: darkColors.white[100],
    placeholder: darkColors.white[300],
  },
};
