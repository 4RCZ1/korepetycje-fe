/**
 * Example component demonstrating the new color system usage
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor, usePrimaryColor, useWarningColor, useErrorColor } from '@/hooks/useThemeColor';
import { ColorCombinations } from '@/utils/colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function ColorSystemExample() {
  const colorScheme = useColorScheme() ?? 'light';
  
  // Using the enhanced useThemeColor hook
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  // Using color variants
  const primaryLight = usePrimaryColor('300');
  const primaryBase = usePrimaryColor('500');
  const primaryDark = usePrimaryColor('700');
  
  const warningColor = useWarningColor('500');
  const errorColor = useErrorColor('500');
  
  // Using color combinations
  const primaryButtonStyle = ColorCombinations[colorScheme].primaryButton;
  const cardStyle = ColorCombinations[colorScheme].card;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>
        Color System Demo
      </Text>
      
      {/* Color variants demonstration */}
      <View style={styles.colorRow}>
        <View style={[styles.colorBox, { backgroundColor: primaryLight }]} />
        <View style={[styles.colorBox, { backgroundColor: primaryBase }]} />
        <View style={[styles.colorBox, { backgroundColor: primaryDark }]} />
      </View>
      
      {/* Button examples */}
      <TouchableOpacity 
        style={[
          styles.button, 
          { 
            backgroundColor: primaryButtonStyle.background,
            borderColor: primaryButtonStyle.border 
          }
        ]}
      >
        <Text style={[styles.buttonText, { color: primaryButtonStyle.text }]}>
          Primary Button
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.button, 
          { 
            backgroundColor: warningColor,
            borderColor: warningColor 
          }
        ]}
      >
        <Text style={[styles.buttonText, { color: 'white' }]}>
          Warning Button
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.button, 
          { 
            backgroundColor: errorColor,
            borderColor: errorColor 
          }
        ]}
      >
        <Text style={[styles.buttonText, { color: 'white' }]}>
          Error Button
        </Text>
      </TouchableOpacity>
      
      {/* Card example */}
      <View 
        style={[
          styles.card,
          {
            backgroundColor: cardStyle.background,
            borderColor: cardStyle.border
          }
        ]}
      >
        <Text style={[styles.cardText, { color: cardStyle.text }]}>
          This is a card using the color system
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  colorBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    minWidth: '100%',
  },
  cardText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
