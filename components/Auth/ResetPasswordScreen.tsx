import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import alert from "@/utils/alert";

type ResetPasswordScreenProps = {
  onResetPassword: (email: string) => Promise<boolean>;
  onNavigateToLogin: () => void;
};

const ResetPasswordScreen = ({ 
  onResetPassword, 
  onNavigateToLogin 
}: ResetPasswordScreenProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");
  const successColor = useThemeColor({}, "primary", "500");

  const validateEmail = (): string | null => {
    if (!email.trim()) return "Email is required";

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const handleResetPassword = async () => {
    const validationError = validateEmail();
    if (validationError) {
      alert("Validation Error", validationError);
      return;
    }

    setLoading(true);
    try {
      const success = await onResetPassword(email.trim());
      if (success) {
        setEmailSent(true);
        alert(
          "Reset Link Sent", 
          "We've sent a password reset link to your email address. Please check your inbox and follow the instructions."
        );
      } else {
        alert(
          "Error", 
          "Unable to send reset email. Please check if the email address is correct and try again."
        );
      }
    } catch (error) {
      console.error("Reset password error:", error);
      alert("Error", "An error occurred while sending the reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setEmailSent(false);
    setEmail("");
  };

  const isFormValid = () => {
    return email.trim() && email.includes("@");
  };

  if (emailSent) {
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ThemedView style={[styles.container, { backgroundColor }]}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Success Message */}
            <View style={styles.header}>
              <View style={[styles.successIcon, { backgroundColor: successColor + "20" }]}>
                <ThemedText style={[styles.successIconText, { color: successColor }]}>
                  ✓
                </ThemedText>
              </View>
              <ThemedText style={[styles.title, { color: textColor }]}>
                Check Your Email
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: textColor + "80" }]}>
                We've sent a password reset link to:
              </ThemedText>
              <ThemedText style={[styles.emailDisplay, { color: primaryColor }]}>
                {email}
              </ThemedText>
            </View>

            <ThemedView style={[styles.formContainer, { backgroundColor: surfaceColor }]}>
              <ThemedText style={[styles.instructionText, { color: textColor + "80" }]}>
                Please check your email and click on the reset link to create a new password. 
                The link will expire in 24 hours.
              </ThemedText>

              <ThemedText style={[styles.instructionText, { color: textColor + "80" }]}>
                Didn't receive the email? Check your spam folder or try again.
              </ThemedText>

              <View style={styles.actionButtons}>
                <ThemedButton
                  title="Try Again"
                  variant="outline"
                  size="large"
                  color="primary"
                  onPress={handleTryAgain}
                  style={styles.actionButton}
                />
                
                <ThemedButton
                  title="Back to Login"
                  variant="filled"
                  size="large"
                  color="primary"
                  onPress={onNavigateToLogin}
                  style={styles.actionButton}
                />
              </View>
            </ThemedView>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    );
  }

  return (
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
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={[styles.title, { color: textColor }]}>
              Reset Password
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: textColor + "80" }]}>
              Enter your email address and we'll send you a link to reset your password
            </ThemedText>
          </View>

          {/* Reset Form */}
          <ThemedView style={[styles.formContainer, { backgroundColor: surfaceColor }]}>
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
                    backgroundColor: backgroundColor 
                  }
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                placeholderTextColor={textColor + "60"}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Reset Button */}
            <ThemedButton
              title={loading ? "Sending Reset Link..." : "Send Reset Link"}
              variant="filled"
              size="large"
              color="primary"
              loading={loading}
              disabled={loading || !isFormValid()}
              onPress={handleResetPassword}
              style={styles.resetButton}
            />

            {/* Back to Login Link */}
            <View style={styles.backToLoginContainer}>
              <ThemedText style={[styles.backToLoginText, { color: textColor + "80" }]}>
                Remember your password?{" "}
              </ThemedText>
              <TouchableOpacity
                onPress={onNavigateToLogin}
                disabled={loading}
              >
                <ThemedText style={[styles.backToLoginLink, { color: primaryColor }]}>
                  Back to Login
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default ResetPasswordScreen;
