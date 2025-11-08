import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedButton from "@/components/ui/ThemedButton";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";
import alert from "@/utils/alert";

const DataRemovalScreen = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");

  const handleSubmit = async () => {
    // Validation
    if (!email.trim()) {
      alert("Błąd", "Proszę podać adres email.", [{ text: "OK" }]);
      return;
    }

    if (!reason.trim()) {
      alert("Błąd", "Proszę podać powód usunięcia danych.", [{ text: "OK" }]);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Błąd", "Proszę podać poprawny adres email.", [{ text: "OK" }]);
      return;
    }

    // Confirmation
    alert(
      "Potwierdzenie",
      "Czy na pewno chcesz złożyć wniosek o usunięcie danych? Ta akcja jest nieodwracalna.",
      [
        {
          text: "Anuluj",
          style: "cancel",
        },
        {
          text: "Potwierdź",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // TODO: Replace with actual API endpoint
              const response = await fetch(
                "https://your-api.com/data-removal-request",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: email.trim(),
                    reason: reason.trim(),
                    userId: user?.email,
                    timestamp: new Date().toISOString(),
                  }),
                },
              );

              if (response.ok) {
                alert(
                  "Sukces",
                  "Twój wniosek o usunięcie danych został przesłany. Skontaktujemy się z Tobą w ciągu 30 dni.",
                  [{ text: "OK" }],
                );
                // Clear form
                setEmail("");
                setReason("");
              } else {
                throw new Error("Request failed");
              }
            } catch (error) {
              console.error("Failed to submit data removal request:", error);
              alert(
                "Błąd",
                "Nie udało się przesłać wniosku. Spróbuj ponownie później lub skontaktuj się z nami bezpośrednio.",
                [{ text: "OK" }],
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContent}
      style={[styles.container, { backgroundColor }]}
    >
      <ThemedView style={[styles.content, { backgroundColor: surfaceColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Usuń Moje Dane
          </ThemedText>
          <ThemedText style={[styles.description, { color: textColor }]}>
            Zgodnie z RODO masz prawo do usunięcia swoich danych osobowych.
            Wypełnij poniższy formularz, aby złożyć wniosek.
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Adres Email *</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor,
                  color: textColor,
                  borderColor,
                },
              ]}
              placeholder="twoj@email.com"
              placeholderTextColor={`${textColor}80`}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Reason Input */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>
              Powód Usunięcia Danych *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor,
                  color: textColor,
                  borderColor,
                },
              ]}
              placeholder="Opisz powód złożenia wniosku..."
              placeholderTextColor={`${textColor}80`}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* Info Box */}
          <ThemedView style={[styles.infoBox, { backgroundColor }]}>
            <ThemedText style={styles.infoText}>
              ℹ️ Po przesłaniu wniosku skontaktujemy się z Tobą w ciągu 30 dni w
              celu potwierdzenia Twojej tożsamości i realizacji wniosku.
            </ThemedText>
          </ThemedView>

          {/* Submit Button */}
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <ThemedText style={styles.loadingText}>
                Wysyłanie wniosku...
              </ThemedText>
            </View>
          ) : (
            <ThemedButton
              title="Złóż Wniosek"
              variant="filled"
              size="medium"
              color="error"
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          )}
        </View>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    opacity: 0.8,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  submitButton: {
    marginTop: 12,
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default DataRemovalScreen;
