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
import { useStudentApi } from "@/hooks/useStudentApi";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StudentGroupType } from "@/types/studentGroup";
import { StudentType } from "@/services/studentApi";

type StudentGroupModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, students: StudentType[]) => Promise<boolean>;
  initialGroup?: StudentGroupType;
  title: string;
};

export default function StudentGroupModal({
  visible,
  onClose,
  onSubmit,
  initialGroup,
  title,
}: StudentGroupModalProps) {
  const [name, setName] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set(),
  );
  const [submitting, setSubmitting] = useState(false);

  const { students, loading: loadingStudents } = useStudentApi();

  // Colors
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");

  useEffect(() => {
    if (visible) {
      if (initialGroup) {
        setName(initialGroup.name);
        setSelectedStudents(new Set(initialGroup.students.map((s) => s.id)));
      } else {
        setName("");
        setSelectedStudents(new Set());
      }
    }
  }, [visible, initialGroup]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const selectedStudentObjects = students.filter((s) =>
        selectedStudents.has(s.id),
      );
      const success = await onSubmit(name, selectedStudentObjects);
      if (success) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStudent = (id: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudents(newSelected);
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
              placeholder="Np. Klasa 3A"
              placeholderTextColor={textColor + "80"}
            />
          </View>

          <ThemedText style={styles.label}>Wybierz uczniów</ThemedText>

          {loadingStudents ? (
            <ActivityIndicator
              size="large"
              color={primaryColor}
              style={styles.loader}
            />
          ) : (
            <ScrollView style={styles.studentList}>
              {students.length === 0 ? (
                <ThemedText
                  style={{
                    color: textColor + "80",
                    textAlign: "center",
                    marginTop: 20,
                  }}
                >
                  Brak dostępnych uczniów
                </ThemedText>
              ) : (
                students.map((student) => {
                  const isSelected = selectedStudents.has(student.id);
                  return (
                    <TouchableOpacity
                      key={student.id}
                      style={[
                        styles.studentItem,
                        {
                          borderColor: isSelected ? primaryColor : borderColor,
                        },
                        isSelected && { backgroundColor: primaryColor + "10" },
                      ]}
                      onPress={() => toggleStudent(student.id)}
                    >
                      <View style={styles.studentIcon}>
                        <MaterialIcons
                          name="person"
                          size={24}
                          color={primaryColor}
                        />
                      </View>
                      <ThemedText
                        style={[styles.studentName, { color: textColor }]}
                        numberOfLines={1}
                      >
                        {student.name} {student.surname}
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
              variant="filled"
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
  studentList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  studentIcon: {
    marginRight: 12,
  },
  studentName: {
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
