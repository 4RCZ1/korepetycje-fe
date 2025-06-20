import { useRouter } from "expo-router";
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
import ThemedButton from "@/components/ui/ThemedButton";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";
import alert from "@/utils/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login: onLogin } = useAuth();

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");

  const router = useRouter();

  const validateForm = (): string | null => {
    if (!email.trim()) return "Email is required";
    if (!password.trim()) return "Password is required";

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    return null;
  };

  const handleLogin = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert("Validation Error", validationError);
      return;
    }

    setLoading(true);
    try {
      const success = await onLogin(email.trim(), password);
      if (success.token) {
        console.log("Login successful, redirecting to home");
        router.replace("/(tabs)/schedule");
      } else if (success.newPasswordRequired && success.authSession) {
        console.log("New password required, redirecting to reset password");
        // Navigate to reset password within auth stack
        setTimeout(() => {
          router.replace({
            pathname: "/resetPassword",
            params: {
              authSession: success.authSession,
              username: email.trim(),
            },
          });
        }, 100);
      } else {
        alert("Error", "Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Error", "An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return email.trim() && password.trim() && email.includes("@");
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
                Welcome Back
              </ThemedText>
              <ThemedText
                style={[styles.subtitle, { color: textColor + "80" }]}
              >
                Sign in to your account
              </ThemedText>
            </View>

            {/* Login Form */}
            <ThemedView
              style={[styles.formContainer, { backgroundColor: surfaceColor }]}
            >
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  Email Address *
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: textColor,
                      borderColor: borderColor,
                      backgroundColor: backgroundColor,
                    },
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={textColor + "60"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  Password *
                </ThemedText>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
                      {
                        color: textColor,
                        borderColor: borderColor,
                        backgroundColor: backgroundColor,
                      },
                    ]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={textColor + "60"}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <ThemedText
                      style={[
                        styles.passwordToggleText,
                        { color: primaryColor },
                      ]}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              <ThemedButton
                title={loading ? "Signing In..." : "Sign In"}
                variant="filled"
                size="large"
                color="primary"
                loading={loading}
                disabled={loading || !isFormValid()}
                onPress={handleLogin}
                style={styles.loginButton}
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
    marginBottom: 20,
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
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    paddingRight: 60,
    fontSize: 16,
    minHeight: 50,
  },
  passwordToggle: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  passwordToggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Login;
