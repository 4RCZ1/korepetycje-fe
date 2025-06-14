import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor, usePrimaryColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link" | "primary" | "warning" | "error";
  intensity?: "100" | "300" | "500" | "700" | "900";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  intensity = "500",
  ...rest
}: ThemedTextProps) {
  // Get color based on type
  let color: string;
  
  if (type === "primary") {
    color = useThemeColor({ light: lightColor, dark: darkColor }, "primary", intensity);
  } else if (type === "warning") {
    color = useThemeColor({ light: lightColor, dark: darkColor }, "warning", intensity);
  } else if (type === "error") {
    color = useThemeColor({ light: lightColor, dark: darkColor }, "error", intensity);
  } else if (type === "link") {
    color = usePrimaryColor("500");
  } else {
    color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  }

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "primary" ? styles.primary : undefined,
        type === "warning" ? styles.warning : undefined,
        type === "error" ? styles.error : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    textDecorationLine: "underline",
  },
  primary: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  warning: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  error: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
});
