import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import PasswordRequirements, {
  validatePassword,
  validatePasswordMatch,
} from "@/components/ui/PasswordRequirements";
import ThemedButton from "@/components/ui/ThemedButton";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";
import alert from "@/utils/alert";

type PasswordScreenMode = "reset" | "change";

const PasswordScreen = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const mode: PasswordScreenMode = "change";
  const { changePassword } = useAuth();
  const router = useRouter();
  const { username, authSession } = useLocalSearchParams<{
    username: string;
    authSession: string;
  }>();
  console.log("ARE WE IN PASSWORD SCREEN", mode, username, authSession);

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");

  const validatePasswordForm = (): string | null => {
    if (!newPassword.trim()) return "Nowe hasło jest wymagane";
    if (!confirmPassword.trim()) return "Potwierdzenie hasła jest wymagane";

    if (!validatePassword(newPassword)) {
      return "Password does not meet security requirements";
    }

    if (!validatePasswordMatch(newPassword, confirmPassword)) {
      return "Hasła nie są zgodne";
    }

    return null;
  };

  const handleChangePassword = async () => {
    const validationError = validatePasswordForm();
    if (validationError) {
      alert("Błąd walidacji", validationError);
      return;
    }

    setLoading(true);
    try {
      const success = await changePassword(username, newPassword, authSession);
      if (success) {
        alert("Sukces", "Hasło zostało zmienione pomyślnie");
        // Navigate to the main app after successful password change
        router.replace("/(tabs)/");
      } else {
        alert("Błąd", "Nie udało się zmienić hasła");
      }
    } catch (error) {
      console.error("Change password error:", error);
      alert("Błąd", "Nie udało się zmienić hasła");
    } finally {
      setLoading(false);
    }
  };

  const isChangeFormValid = () => {
    return (
      validatePassword(newPassword) &&
      validatePasswordMatch(newPassword, confirmPassword)
    );
  };

  const getTitle = () => {
    // @ts-ignore
    return mode === "reset" ? "Reset Password" : "Change Password Required";
  };

  const getSubtitle = () => {
    // @ts-ignore
    if (mode === "reset") {
      return "Wpisz swój adres email, a wyślemy Ci link do resetowania hasła";
    } else {
      return "Twoje hasło musi zostać zmienione przed kontynuowaniem. Wprowadź nowe hasło spełniające wymagania bezpieczeństwa.";
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor,
      }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ThemedView style={[styles.container, { backgroundColor }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <ThemedText style={[styles.title, { color: textColor }]}>
                {getTitle()}
              </ThemedText>
              <ThemedText
                style={[styles.subtitle, { color: textColor + "80" }]}
              >
                {getSubtitle()}
              </ThemedText>
              {mode === "change" && username && (
                <ThemedText
                  style={[styles.emailDisplay, { color: primaryColor }]}
                >
                  Konto: {username}
                </ThemedText>
              )}
            </View>
            {/* Form */}
            <ThemedView
              style={[styles.formContainer, { backgroundColor: surfaceColor }]}
            >
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  Nowe Hasło *
                </ThemedText>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      {
                        backgroundColor: backgroundColor,
                        borderColor: borderColor,
                        color: textColor,
                      },
                    ]}
                    placeholder="Wpisz nowe hasło"
                    placeholderTextColor={textColor + "60"}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <ThemedText
                      style={[styles.eyeText, { color: primaryColor }]}
                    >
                      {showNewPassword ? "Ukryj" : "Pokaż"}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  Potwierdź Hasło *
                </ThemedText>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      {
                        backgroundColor: backgroundColor,
                        borderColor: borderColor,
                        color: textColor,
                      },
                    ]}
                    placeholder="Potwierdź nowe hasło"
                    placeholderTextColor={textColor + "60"}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <ThemedText
                      style={[styles.eyeText, { color: primaryColor }]}
                    >
                      {showConfirmPassword ? "Ukryj" : "Pokaż"}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.requirementsContainer}>
                <PasswordRequirements
                  password={newPassword}
                  confirmPassword={confirmPassword}
                  showConfirmMatch={true}
                />
              </View>

              <ThemedButton
                title={loading ? "Zmiana hasła..." : "Zmień Hasło"}
                variant="filled"
                size="large"
                color="primary"
                loading={loading}
                disabled={loading || !isChangeFormValid()}
                onPress={handleChangePassword}
                style={styles.resetButton}
              />
            </ThemedView>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 500,
    width: "100%",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  emailDisplay: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  formContainer: {
    borderRadius: 12,
    padding: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    minHeight: 50,
  },
  resetButton: {
    marginBottom: 24,
  },
  backToLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  backToLoginText: {
    fontSize: 14,
  },
  backToLoginLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    minHeight: 50,
    paddingRight: 60,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    paddingVertical: 4,
  },
  eyeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  requirementsContainer: {
    marginBottom: 24,
  },
});

export default PasswordScreen;
