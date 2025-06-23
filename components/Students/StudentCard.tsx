import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StudentType, StudentUpdateRequestType } from "@/services/studentApi";
import alert from "@/utils/alert";

import EditStudentModal from "./EditStudentModal";

type StudentCardProps = {
  student: StudentType;
  onDelete: (studentId: string) => Promise<boolean>;
  onUpdate: (
    studentId: string,
    studentData: StudentUpdateRequestType,
  ) => Promise<boolean>;
  isDeleting: boolean;
  isUpdating: boolean;
};

const StudentCard = ({
  student,
  onDelete,
  onUpdate,
  isDeleting,
  isUpdating,
}: StudentCardProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const backgroundColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");

  const handleDelete = () => {
    console.log("Delete student:", student.id);
    alert(
      "Delete Student",
      `Are you sure you want to delete ${student.name} ${student.surname}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await onDelete(student.id);
            if (!success) {
              alert("Błąd", "Nie udało się usunąć ucznia");
            }
          },
        },
      ],
    );
  };

  const handleUpdate = async (
    studentId: string,
    studentData: StudentUpdateRequestType,
  ) => {
    const success = await onUpdate(studentId, studentData);
    if (!success) {
      alert("Błąd", "Nie udało się zaktualizować ucznia");
    }
    return success;
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={[styles.name, { color: textColor }]}>
            {student.name} {student.surname}
          </ThemedText>
          <View style={styles.buttonContainer}>
            <ThemedButton
              variant="outline"
              size="small"
              color="primary"
              icon="pencil"
              loading={isUpdating}
              disabled={isUpdating || isDeleting}
              onPress={() => setShowEditModal(true)}
            />
            <ThemedButton
              variant="outline"
              size="small"
              color="error"
              icon="trash.fill"
              loading={isDeleting}
              disabled={isDeleting || isUpdating}
              onPress={handleDelete}
            />
          </View>
        </View>

        <View style={styles.addressSection}>
          <ThemedText
            style={[styles.addressLabel, { color: textColor + "80" }]}
          >
            Adres:
          </ThemedText>
          <ThemedText style={[styles.addressName, { color: primaryColor }]}>
            {student.address.name}
          </ThemedText>
          <ThemedText style={[styles.addressData, { color: textColor + "60" }]}>
            {student.address.data}
          </ThemedText>
        </View>
      </View>

      <EditStudentModal
        visible={showEditModal}
        student={student}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdate}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginLeft: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 36,
    minHeight: 36,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  addressSection: {
    gap: 4,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
  },
  addressData: {
    fontSize: 14,
  },
});

export default StudentCard;
