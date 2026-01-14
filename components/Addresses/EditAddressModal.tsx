import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AddressType, AddressUpdateRequestType } from "@/services/addressApi";
import alert from "@/utils/alert";

type EditAddressModalProps = {
  visible: boolean;
  address: AddressType | null;
  onClose: () => void;
  onSubmit: (
    addressId: string,
    addressData: AddressUpdateRequestType,
  ) => Promise<boolean>;
};

const EditAddressModal = ({
  visible,
  address,
  onClose,
  onSubmit,
}: EditAddressModalProps) => {
  // State for form fields
  const [name, setName] = useState("");
  const [data, setData] = useState("");

  // State for submission
  const [submitting, setSubmitting] = useState(false);

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");

  // Load data when modal opens
  useEffect(() => {
    if (visible && address) {
      setName(address.name);
      setData(address.data);
    }
  }, [visible, address]);

  const handleSubmit = async () => {
    if (!address) return;

    if (!name.trim()) {
      alert("Błąd", "Nazwa adresu jest wymagana");
      return;
    }

    if (!data.trim()) {
      alert("Błąd", "Dane adresu są wymagane");
      return;
    }

    try {
      setSubmitting(true);

      const updateData: AddressUpdateRequestType = {};

      // Only include fields that have changed
      if (name !== address.name) {
        updateData.name = name.trim();
      }
      if (data !== address.data) {
        updateData.data = data.trim();
      }

      // Only submit if there are actual changes
      if (Object.keys(updateData).length === 0) {
        alert("Informacja", "Brak zmian do zapisania");
        return;
      }

      const success = await onSubmit(address.id, updateData);

      if (success) {
        handleClose();
      }
    } catch (error) {
      alert(
        "Błąd",
        "Nie udało się zaktualizować adresu" +
          (error instanceof Error ? `: ${error.message}` : ""),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setData("");
    onClose();
  };

  if (!address) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedButton
            title="Anuluj"
            variant="outline"
            size="small"
            color="primary"
            onPress={handleClose}
            style={styles.headerButton}
          />
          <ThemedText style={[styles.title, { color: textColor }]}>
            Edytuj Adres
          </ThemedText>
          <ThemedButton
            title="Zapisz"
            variant="filled"
            size="small"
            color="primary"
            loading={submitting}
            disabled={submitting}
            onPress={handleSubmit}
            style={styles.headerButton}
          />
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          <ThemedView
            style={[styles.section, { backgroundColor: surfaceColor }]}
          >
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Informacje o Adresie
            </ThemedText>

            <View style={styles.field}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Nazwa Adresu *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, borderColor: textColor + "20" },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Wpisz nazwę adresu"
                placeholderTextColor={textColor + "60"}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Dane Adresu *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: textColor, borderColor: textColor + "20" },
                ]}
                value={data}
                onChangeText={setData}
                placeholder="Wpisz szczegóły adresu"
                placeholderTextColor={textColor + "60"}
                multiline
                numberOfLines={3}
              />
            </View>
          </ThemedView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#00000010",
  },
  headerButton: {
    minWidth: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});

export default EditAddressModal;
