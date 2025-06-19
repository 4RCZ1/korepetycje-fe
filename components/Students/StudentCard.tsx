import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StudentType } from "@/services/studentApi";

type StudentCardProps = {
  student: StudentType;
  onDelete: (studentId: string) => Promise<boolean>;
  isDeleting: boolean;
};

const StudentCard = ({ student, onDelete, isDeleting }: StudentCardProps) => {
  const backgroundColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error", "500");

  const handleDelete = () => {
    Alert.alert(
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
              Alert.alert("Error", "Failed to delete student");
            }
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={[styles.name, { color: textColor }]}>
            {student.name} {student.surname}
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.deleteButton,
              { borderColor: errorColor },
              isDeleting && styles.disabledButton,
            ]}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={errorColor} />
            ) : (
              <IconSymbol
                name="trash.fill"
                size={18}
                color={errorColor}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.addressSection}>
          <ThemedText
            style={[styles.addressLabel, { color: textColor + "80" }]}
          >
            Address:
          </ThemedText>
          <ThemedText style={[styles.addressName, { color: primaryColor }]}>
            {student.address.name}
          </ThemedText>
          <ThemedText style={[styles.addressData, { color: textColor + "60" }]}>
            {student.address.data}
          </ThemedText>
        </View>
      </View>
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
  disabledButton: {
    opacity: 0.6,
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
