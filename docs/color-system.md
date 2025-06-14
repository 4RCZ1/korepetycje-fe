# Color System Documentation

This application uses a comprehensive color system with automatic dark mode support and intensity variants for consistent theming across the app.

## Base Colors

The color palette is based on five primary colors:

- **Primary**: `#0099D5` - Main brand color
- **Warning**: `#FF9F1C` - Warning states and notifications
- **Error**: `#BF211E` - Error states and destructive actions
- **White**: `#EBFBFC` - Light backgrounds and text
- **Black**: `#191919` - Dark backgrounds and text

## Color Intensities

Each color has 5 intensity variants:

- **100**: Lightest shade (subtle backgrounds, hover states)
- **300**: Light shade (secondary elements)
- **500**: Base color (primary usage)
- **700**: Dark shade (emphasis, borders)
- **900**: Darkest shade (high contrast text)

## Dark Mode

The system automatically generates dark mode variants using color theory principles:
- Colors are adjusted for better contrast and readability in dark environments
- Saturation is slightly reduced for less eye strain
- Lightness values are intelligently inverted

## Usage Examples

### 1. Using Hooks

```tsx
import { useThemeColor, usePrimaryColor, useWarningColor, useErrorColor } from '@/hooks/useThemeColor';

function MyComponent() {
  // Basic semantic colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  // Color variants with intensity
  const primaryLight = usePrimaryColor('300');
  const primaryBase = usePrimaryColor('500');
  const primaryDark = usePrimaryColor('700');
  
  // Specific color types
  const warningColor = useWarningColor('500');
  const errorColor = useErrorColor('700');
  
  return (
    <View style={{ backgroundColor }}>
      <Text style={{ color: textColor }}>Hello World</Text>
      <View style={{ backgroundColor: primaryBase }}>
        <Text style={{ color: primaryLight }}>Primary Content</Text>
      </View>
    </View>
  );
}
```

### 2. Using ThemedText Component

```tsx
import { ThemedText } from '@/components/ThemedText';

function MyComponent() {
  return (
    <View>
      <ThemedText type="title">Main Title</ThemedText>
      <ThemedText type="primary" intensity="700">Primary Text</ThemedText>
      <ThemedText type="warning">Warning Message</ThemedText>
      <ThemedText type="error" intensity="900">Error Message</ThemedText>
      <ThemedText type="link">Link Text</ThemedText>
    </View>
  );
}
```

### 3. Using Color Utilities

```tsx
import { getColor, ColorCombinations } from '@/utils/colors';
import { useColorScheme } from '@/hooks/useColorScheme';

function MyComponent() {
  const colorScheme = useColorScheme() ?? 'light';
  
  // Direct color access
  const primaryColor = getColor(colorScheme, 'primary', '500');
  
  // Pre-defined combinations
  const buttonStyle = ColorCombinations[colorScheme].primaryButton;
  
  return (
    <TouchableOpacity
      style={{
        backgroundColor: buttonStyle.background,
        borderColor: buttonStyle.border,
        borderWidth: 1,
      }}
    >
      <Text style={{ color: buttonStyle.text }}>
        Button Text
      </Text>
    </TouchableOpacity>
  );
}
```

### 4. Direct Access to Colors Object

```tsx
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

function MyComponent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  return (
    <View style={{ backgroundColor: colors.primary['100'] }}>
      <Text style={{ color: colors.primary['900'] }}>
        Light background, dark text
      </Text>
    </View>
  );
}
```

## Color Combinations

Pre-defined color combinations are available for common UI patterns:

### Buttons
- `ColorCombinations[scheme].primaryButton`
- `ColorCombinations[scheme].warningButton`
- `ColorCombinations[scheme].errorButton`

### Cards
- `ColorCombinations[scheme].card`

## Semantic Colors

The following semantic colors are available for common UI elements:

- `text`: Default text color
- `background`: Main background color
- `surface`: Card/surface background
- `tint`: App tint color
- `icon`: Default icon color
- `tabIconDefault`: Inactive tab icon
- `tabIconSelected`: Active tab icon
- `border`: Default border color
- `placeholder`: Placeholder text color

## Best Practices

1. **Use semantic colors first**: Prefer `background`, `text`, etc. over specific color names when possible
2. **Consistent intensity**: Use the same intensity levels for similar UI elements
3. **Contrast considerations**: Test your color combinations for accessibility
4. **Dark mode testing**: Always test your UI in both light and dark modes
5. **Use pre-defined combinations**: Leverage `ColorCombinations` for consistent styling

## Migration from Old System

If you have existing components using the old color system:

1. Replace direct color values with hook-based colors
2. Update `useThemeColor` calls to use the new signature
3. Consider using the enhanced `ThemedText` component for text elements
4. Test in both light and dark modes

## Type Safety

The system is fully typed with TypeScript:

```tsx
type ColorIntensity = '100' | '300' | '500' | '700' | '900';
type ColorName = 'primary' | 'warning' | 'error' | 'white' | 'black';
type SemanticColorName = 'text' | 'background' | 'surface' | 'tint' | 'icon' | 'tabIconDefault' | 'tabIconSelected' | 'border' | 'placeholder';
```

This ensures you can only use valid color names and intensities, catching errors at compile time.
