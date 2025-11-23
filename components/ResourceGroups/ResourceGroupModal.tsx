import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import ThemedButton from "@/components/ui/ThemedButton";
import { useResourceApi } from "@/hooks/useResourceApi";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ResourceGroupType, ResourceType } from "@/types/resource";
import { getFileIcon } from "@/utils/fileHelpers";

type ResourceGroupModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, resources: ResourceType[]) => Promise<boolean>;
  initialGroup?: ResourceGroupType;
  title: string;
};

export default function ResourceGroupModal({
  visible,
  onClose,
  onSubmit,
  initialGroup,
  title,
}: ResourceGroupModalProps) {
  const [name, setName] = useState("");
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set(),
  );
  const [submitting, setSubmitting] = useState(false);

  const { resources, loading: loadingResources } = useResourceApi();

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");

  useEffect(() => {
    if (visible) {
      if (initialGroup) {
        setName(initialGroup.name);
        setSelectedResources(new Set(initialGroup.resources.map((r) => r.id)));
      } else {
        setName("");
        setSelectedResources(new Set());
      }
    }
  }, [visible, initialGroup]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const selectedResourceObjects = resources.filter((r) =>
        selectedResources.has(r.id),
      );
      const success = await onSubmit(name, selectedResourceObjects);
      if (success) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleResource = (id: string) => {
    const newSelected = new Set(selectedResources);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedResources(newSelected);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <ThemedView
          style={[styles.modalView, { backgroundColor: surfaceColor }]}
        >
          <View style={styles.header}>
            <ThemedText type="subtitle">{title}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Nazwa grupy</ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: textColor, borderColor: borderColor },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Np. Materiały do matury"
              placeholderTextColor={textColor + "80"}
            />
          </View>

          <ThemedText style={styles.label}>Wybierz zasoby</ThemedText>

          {loadingResources ? (
            <ActivityIndicator
              size="large"
              color={primaryColor}
              style={styles.loader}
            />
          ) : (
            <ScrollView style={styles.resourceList}>
              {resources.length === 0 ? (
                <ThemedText
                  style={{
                    color: textColor + "80",
                    textAlign: "center",
                    marginTop: 20,
                  }}
                >
                  Brak dostępnych zasobów
                </ThemedText>
              ) : (
                resources.map((resource) => {
                  const isSelected = selectedResources.has(resource.id);
                  return (
                    <TouchableOpacity
                      key={resource.id}
                      style={[
                        styles.resourceItem,
                        {
                          borderColor: isSelected ? primaryColor : borderColor,
                        },
                        isSelected && { backgroundColor: primaryColor + "10" },
                      ]}
                      onPress={() => toggleResource(resource.id)}
                    >
                      <View style={styles.resourceIcon}>
                        <MaterialIcons
                          name={getFileIcon(resource.fileType, resource.name)}
                          size={24}
                          color={primaryColor}
                        />
                      </View>
                      <ThemedText
                        style={[styles.resourceName, { color: textColor }]}
                        numberOfLines={1}
                      >
                        {resource.name}
                      </ThemedText>
                      <View style={[styles.checkbox, { borderColor }]}>
                        {isSelected && (
                          <IconSymbol
                            name="checkmark"
                            size={16}
                            color={primaryColor}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <ThemedButton
              title="Anuluj"
              variant="outline"
              onPress={onClose}
              style={styles.button}
            />
            <ThemedButton
              title="Zapisz"
              variant="primary"
              onPress={handleSubmit}
              loading={submitting}
              disabled={!name.trim() || submitting}
              style={styles.button}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalView: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  resourceList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  resourceIcon: {
    marginRight: 12,
  },
  resourceName: {
    flex: 1,
    fontSize: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
});
