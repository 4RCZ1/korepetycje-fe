import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";

import AssignResourceModal from "@/components/Assignments/AssignResourceModal";
import ViewAssignmentsModal from "@/components/Assignments/ViewAssignmentsModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ResourceType } from "@/types/resource";
import alert from "@/utils/alert";
import { getFileIcon, formatFileSize } from "@/utils/fileHelpers";

type ResourceCardProps = {
  resource: ResourceType;
  onDelete?: (resourceId: string) => Promise<boolean>;
  onDownload: (resourceId: string) => Promise<string | null>;
  isDeleting?: boolean;
  viewMode?: "tutor" | "student";
};

const ResourceCard = ({
  resource,
  onDelete,
  onDownload,
  isDeleting = false,
  viewMode = "tutor",
}: ResourceCardProps) => {
  const [downloading, setDownloading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewAssignmentsModal, setShowViewAssignmentsModal] =
    useState(false);
  const [refetchAssignments, setRefetchAssignments] = useState<
    (() => Promise<void>) | null
  >(null);

  // Colors
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error", "500");

  const handleDelete = () => {
    if (!onDelete) return;
    alert("Usuń Zasób", `Czy na pewno chcesz usunąć "${resource.name}"?`, [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: async () => {
          const success = await onDelete(resource.id);
          if (success) {
            alert("Sukces", "Zasób został usunięty");
          } else {
            alert("Błąd", "Nie udało się usunąć zasobu");
          }
        },
      },
    ]);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const downloadUrl = await onDownload(resource.id);
      if (downloadUrl) {
        // Open the download URL in the browser
        const supported = await Linking.canOpenURL(downloadUrl);
        if (supported) {
          await Linking.openURL(downloadUrl);
        } else {
          alert("Błąd", "Nie można otworzyć URL pobierania");
        }
      } else {
        alert("Błąd", "Nie udało się pobrać URL pobierania");
      }
    } catch (error) {
      console.error("Error downloading resource:", error);
      alert("Błąd", "Nie udało się pobrać zasobu");
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          <MaterialIcons
            name={getFileIcon(resource.fileType, resource.name)}
            size={32}
            color={primaryColor}
          />
        </View>
        <View style={styles.infoContainer}>
          <ThemedText style={[styles.name, { color: textColor }]}>
            {resource.name}
          </ThemedText>
          <View style={styles.metaContainer}>
            {resource.fileSize && (
              <ThemedText style={[styles.meta, { color: textColor + "80" }]}>
                {formatFileSize(resource.fileSize)}
              </ThemedText>
            )}
            {resource.uploadDate && (
              <ThemedText style={[styles.meta, { color: textColor + "80" }]}>
                • {formatDate(resource.uploadDate)}
              </ThemedText>
            )}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <ThemedButton
          title="Pobierz"
          variant="outline"
          size="small"
          color="primary"
          onPress={handleDownload}
          loading={downloading}
          disabled={downloading || isDeleting}
          style={viewMode === "student" ? styles.actionButtonFullWidth : styles.actionButton}
        />
        {viewMode !== "student" && (
          <ThemedButton
            title="Przypisz"
            variant="outline"
            size="small"
            color="primary"
            onPress={() => setShowAssignModal(true)}
            disabled={isDeleting}
            style={styles.actionButton}
          />
        )}
        {viewMode !== "student" && (
          <TouchableOpacity
            onPress={() => setShowViewAssignmentsModal(true)}
            disabled={isDeleting}
            style={[styles.infoButton, isDeleting && styles.buttonDisabled]}
          >
            <MaterialIcons name="people" size={20} color={primaryColor} />
          </TouchableOpacity>
        )}
        {viewMode !== "student" && (
          <TouchableOpacity
            onPress={handleDelete}
            disabled={isDeleting || downloading}
            style={[
              styles.deleteButton,
              (isDeleting || downloading) && styles.buttonDisabled,
            ]}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={errorColor} />
            ) : (
              <IconSymbol name="trash.fill" size={20} color={errorColor} />
            )}
          </TouchableOpacity>
        )}
      </View>

      <AssignResourceModal
        visible={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={async () => {
          // Refetch assignments after successful creation
          if (refetchAssignments) {
            await refetchAssignments();
          }
        }}
        preSelectedResources={[resource]}
        mode="resourceToStudent"
        title={`Przypisz: ${resource.name}`}
      />

      <ViewAssignmentsModal
        visible={showViewAssignmentsModal}
        onClose={() => setShowViewAssignmentsModal(false)}
        viewMode={{ type: "resource", resource }}
        onRefetch={(refetchFn) => setRefetchAssignments(() => refetchFn)}
      />
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
  actionButtonFullWidth: {
    flex: 1,
  },
  infoButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#00000010",
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#ff000015",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ResourceCard;
