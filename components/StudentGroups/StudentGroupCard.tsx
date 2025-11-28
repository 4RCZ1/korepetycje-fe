import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StudentGroupType } from "@/types/studentGroup";
import alert from "@/utils/alert";

type StudentGroupCardProps = {
  group: StudentGroupType;
  onDelete: (groupId: string) => Promise<boolean>;
  onEdit: (group: StudentGroupType) => void;
  isDeleting?: boolean;
};

const StudentGroupCard = ({
  group,
  onDelete,
  onEdit,
  isDeleting = false,
}: StudentGroupCardProps) => {
  // Colors
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error", "500");

  const handleDelete = () => {
    alert("Usuń Grupę", `Czy na pewno chcesz usunąć grupę "${group.name}"?`, [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: async () => {
          const success = await onDelete(group.id);
          if (success) {
            alert("Sukces", "Grupa została usunięta");
          } else {
            alert("Błąd", "Nie udało się usunąć grupy");
          }
        },
      },
    ]);
  };

  return (
    <ThemedView
      style={[
        styles.card,
        { backgroundColor: surfaceColor, borderColor: primaryColor + "30" },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="people" size={32} color={primaryColor} />
        </View>
        <View style={styles.infoContainer}>
          <ThemedText style={[styles.name, { color: textColor }]}>
            {group.name}
          </ThemedText>
          <View style={styles.metaContainer}>
            <ThemedText style={[styles.meta, { color: textColor + "80" }]}>
              {group.students.length} uczniów
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <ThemedButton
          title="Edytuj"
          variant="outline"
          size="small"
          color="primary"
          onPress={() => onEdit(group)}
          disabled={isDeleting}
          style={styles.actionButton}
        />
        <TouchableOpacity
          onPress={handleDelete}
          disabled={isDeleting}
          style={[
            styles.deleteButton,
            isDeleting && styles.deleteButtonDisabled,
          ]}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={errorColor} />
          ) : (
            <IconSymbol name="trash.fill" size={20} color={errorColor} />
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#00000010",
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  meta: {
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#ff000015",
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
});

export default StudentGroupCard;
