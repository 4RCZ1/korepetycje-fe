import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
}

interface PasswordRequirementsProps {
  password: string;
  confirmPassword?: string;
  showConfirmMatch?: boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: "Co najmniej 8 znaków",
    validator: (password) => password.length >= 8,
  },
  {
    label: "Zawiera wielką literę (A-Z)",
    validator: (password) => /[A-Z]/.test(password),
  },
  {
    label: "Zawiera małą literę (a-z)",
    validator: (password) => /[a-z]/.test(password),
  },
  {
    label: "Zawiera co najmniej jedną cyfrę (0-9)",
    validator: (password) => /[0-9]/.test(password),
  },
  {
    label: "Zawiera znak specjalny (!@#$%^&*)",
    validator: (password) => /[^a-zA-Z0-9]/.test(password),
  },
];

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  confirmPassword,
  showConfirmMatch = false,
}) => {
  const textColor = useThemeColor({}, "text");
  const successColor = useThemeColor({}, "primary", "500");
  const errorColor = useThemeColor({}, "error", "500");
  const pendingColor = useThemeColor({}, "text") + "40"; // 40% opacity

  const getRequirementColor = (isValid: boolean, hasInput: boolean) => {
    if (!hasInput) return pendingColor;
    return isValid ? successColor : errorColor;
  };

  const getRequirementIcon = (isValid: boolean, hasInput: boolean) => {
    if (!hasInput) return "○";
    return isValid ? "✓" : "✗";
  };

  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;
  const confirmHasInput = confirmPassword ? confirmPassword.length > 0 : false;

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.title, { color: textColor }]}>
        Wymagania dotyczące hasła:
      </ThemedText>

      {PASSWORD_REQUIREMENTS.map((requirement, index) => {
        const isValid = requirement.validator(password);
        const hasInput = password.length > 0;
        const color = getRequirementColor(isValid, hasInput);
        const icon = getRequirementIcon(isValid, hasInput);

        return (
          <View key={index} style={styles.requirement}>
            <ThemedText style={[styles.icon, { color }]}>{icon}</ThemedText>
            <ThemedText style={[styles.text, { color }]}>
              {requirement.label}
            </ThemedText>
          </View>
        );
      })}
      {showConfirmMatch && confirmPassword !== undefined && (
        <View style={styles.requirement}>
          <ThemedText
            style={[
              styles.icon,
              {
                color: getRequirementColor(
                  Boolean(passwordsMatch),
                  confirmHasInput,
                ),
              },
            ]}
          >
            {getRequirementIcon(Boolean(passwordsMatch), confirmHasInput)}
          </ThemedText>
          <ThemedText
            style={[
              styles.text,
              {
                color: getRequirementColor(
                  Boolean(passwordsMatch),
                  confirmHasInput,
                ),
              },
            ]}
          >
            Hasła są zgodne
          </ThemedText>
        </View>
      )}
    </View>
  );
};

export const validatePassword = (password: string): boolean => {
  return PASSWORD_REQUIREMENTS.every((req) => req.validator(password));
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): boolean => {
  return password === confirmPassword && password.length > 0;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  icon: {
    fontSize: 14,
    fontWeight: "bold",
    width: 20,
    textAlign: "center",
  },
  text: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

export default PasswordRequirements;
