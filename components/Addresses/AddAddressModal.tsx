import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AddressRequestType } from "@/services/addressApi";
import alert from "@/utils/alert";

type AddAddressModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (addressData: AddressRequestType) => Promise<boolean>;
};

const AddAddressModal = ({
  visible,
  onClose,
  onSubmit,
}: AddAddressModalProps) => {
  // State for form fields
  const [name, setName] = useState("");
  const [data, setData] = useState("");

  // State for submission
  const [submitting, setSubmitting] = useState(false);

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setName("");
    setData("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): string | null => {
    if (!name.trim()) return "Nazwa adresu jest wymagana";
    if (!data.trim()) return "Dane adresu są wymagane";
    return null;
  };

  const isFormValid = () => {
    return !!name.trim() && !!data.trim();
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert("Błąd walidacji", validationError);
      return;
    }

    setSubmitting(true);
    try {
      const addressData: AddressRequestType = {
        name: name.trim(),
        data: data.trim(),
      };

      const success = await onSubmit(addressData);
      if (success) {
        alert("Sukces", "Adres został utworzony pomyślnie");
        handleClose();
      } else {
        alert("Błąd", "Nie udało się utworzyć adresu");
      }
    } catch (error) {
      console.error("Failed to submit address:", error);
      alert("Błąd", "Nie udało się utworzyć adresu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.title}>Dodaj Nowy Adres</ThemedText>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: primaryColor }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Nazwa Adresu *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: primaryColor },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Wpisz nazwę adresu (np. Dom, Biuro)"
                placeholderTextColor={textColor + "80"}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Dane Adresu *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: textColor, borderColor: primaryColor },
                ]}
                value={data}
                onChangeText={setData}
                placeholder="Wpisz szczegóły adresu (miasto, ulica, numer)"
                placeholderTextColor={textColor + "80"}
                multiline
                numberOfLines={3}
              />
            </View>

            <ThemedButton
              title="Utwórz Adres"
              variant="filled"
              size="large"
              color="primary"
              loading={submitting}
              disabled={submitting || !isFormValid()}
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "transparent",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});

export default AddAddressModal;
