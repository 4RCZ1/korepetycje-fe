import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";

type SFSymbolName = React.ComponentProps<typeof IconSymbol>["name"];

type ThemedButtonVariant = "filled" | "outline";
type ThemedButtonSize = "small" | "medium" | "large";
type ThemedButtonColor = "primary" | "error" | "surface";

type ThemedButtonProps = {
  title?: string;
  variant?: ThemedButtonVariant;
  size?: ThemedButtonSize;
  color?: ThemedButtonColor;
  disabled?: boolean;
  loading?: boolean;
  icon?: SFSymbolName;
  iconSize?: number;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
};

const ThemedButton = ({
  title,
  variant = "filled",
  size = "medium",
  color = "primary",
  disabled = false,
  loading = false,
  icon,
  iconSize,
  onPress,
  style,
  textStyle,
  children,
}: ThemedButtonProps) => {
  // Theme colors
  const primaryColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error", "500");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");

  // Get colors based on color prop
  const getButtonColors = () => {
    switch (color) {
      case "primary":
        return {
          backgroundColor: primaryColor,
          borderColor: primaryColor,
          textColor: variant === "filled" ? "white" : primaryColor,
          loadingColor: variant === "filled" ? "white" : primaryColor,
        };
      case "error":
        return {
          backgroundColor: errorColor,
          borderColor: errorColor,
          textColor: variant === "filled" ? "white" : errorColor,
          loadingColor: variant === "filled" ? "white" : errorColor,
        };
      case "surface":
        return {
          backgroundColor: surfaceColor,
          borderColor: surfaceColor,
          textColor: textColor,
          loadingColor: textColor,
        };
      default:
        return {
          backgroundColor: primaryColor,
          borderColor: primaryColor,
          textColor: variant === "filled" ? "white" : primaryColor,
          loadingColor: variant === "filled" ? "white" : primaryColor,
        };
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          container: styles.smallContainer,
          text: styles.smallText,
          iconSize: iconSize || 16,
        };
      case "medium":
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
          iconSize: iconSize || 18,
        };
      case "large":
        return {
          container: styles.largeContainer,
          text: styles.largeText,
          iconSize: iconSize || 20,
        };
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
          iconSize: iconSize || 18,
        };
    }
  };
  const colors = getButtonColors();
  const sizeStyles = getSizeStyles();

  const buttonStyle = [
    styles.button,
    sizeStyles.container,
    {
      backgroundColor:
        variant === "filled" ? colors.backgroundColor : "transparent",
      borderColor: colors.borderColor,
      borderWidth: variant === "outline" ? 1 : 0,
    },
    disabled && styles.disabled,
    style,
  ].filter(Boolean);

  const buttonTextStyle = [
    styles.text,
    sizeStyles.text,
    {
      color: colors.textColor,
    },
    textStyle,
  ].filter(Boolean);

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={colors.loadingColor} />;
    }

    if (children) {
      return children;
    }

    if (icon && title) {
      return (
        <>
          <IconSymbol
            name={icon}
            size={sizeStyles.iconSize}
            color={colors.textColor}
            style={styles.iconWithText}
          />
          <ThemedText style={buttonTextStyle}>{title}</ThemedText>
        </>
      );
    }

    if (icon) {
      return (
        <IconSymbol
          name={icon}
          size={sizeStyles.iconSize}
          color={colors.textColor}
        />
      );
    }

    if (title) {
      return <ThemedText style={buttonTextStyle}>{title}</ThemedText>;
    }

    return null;
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
  iconWithText: {
    marginRight: 8,
  },
  // Small size
  smallContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 36,
    minHeight: 36,
  },
  smallText: {
    fontSize: 14,
  },
  // Medium size
  mediumContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 44,
    minHeight: 44,
  },
  mediumText: {
    fontSize: 16,
  },
  // Large size
  largeContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 52,
    minHeight: 52,
  },
  largeText: {
    fontSize: 18,
  },
});

export default ThemedButton;
