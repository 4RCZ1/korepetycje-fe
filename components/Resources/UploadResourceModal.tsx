import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import ThemedButton from "@/components/ui/ThemedButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import alert from "@/utils/alert";
import { getFileIcon, formatFileSize } from "@/utils/fileHelpers";

type UploadResourceModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (file: DocumentPicker.DocumentPickerAsset) => Promise<boolean>;
};

const UploadResourceModal = ({
  visible,
  onClose,
  onSubmit,
}: UploadResourceModalProps) => {
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      onClose();
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      alert("Błąd", "Nie udało się wybrać pliku");
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Błąd", "Proszę wybrać plik");
      return;
    }

    setUploading(true);
    try {
      const success = await onSubmit(selectedFile);
      if (success) {
        alert("Sukces", "Plik został przesłany pomyślnie");
        setSelectedFile(null);
        onClose();
      } else {
        alert("Błąd", "Nie udało się przesłać pliku");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Błąd", "Nie udało się przesłać pliku");
    } finally {
      setUploading(false);
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
          <ThemedText style={styles.title}>Prześlij Zasób</ThemedText>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            disabled={uploading}
          >
            <Text
              style={[
                styles.closeButtonText,
                { color: primaryColor },
                uploading && styles.closeButtonDisabled,
              ]}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* File Picker Section */}
            <View style={styles.pickerSection}>
              <ThemedText style={[styles.label, { color: textColor }]}>
                Wybierz Plik
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  { borderColor: primaryColor, backgroundColor: surfaceColor },
                ]}
                onPress={handlePickDocument}
                disabled={uploading}
              >
                <MaterialIcons name="folder" size={32} color={primaryColor} />
                <ThemedText
                  style={[styles.pickerButtonText, { color: primaryColor }]}
                >
                  Wybierz plik z urządzenia
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Selected File Preview */}
            {selectedFile && (
              <View style={styles.previewSection}>
                <ThemedText style={[styles.label, { color: textColor }]}>
                  Wybrany Plik
                </ThemedText>
                <View
                  style={[
                    styles.filePreview,
                    {
                      backgroundColor: surfaceColor,
                      borderColor: primaryColor + "30",
                    },
                  ]}
                >
                  <View style={styles.filePreviewHeader}>
                    <View style={styles.fileIconContainer}>
                      <MaterialIcons
                        name={getFileIcon(
                          selectedFile?.mimeType,
                          selectedFile?.name,
                        )}
                        size={40}
                        color={primaryColor}
                      />
                    </View>
                    <View style={styles.fileInfo}>
                      <ThemedText
                        style={[styles.fileName, { color: textColor }]}
                        numberOfLines={2}
                      >
                        {selectedFile.name}
                      </ThemedText>
                      <ThemedText
                        style={[styles.fileSize, { color: textColor + "80" }]}
                      >
                        {formatFileSize(selectedFile.size)}
                      </ThemedText>
                      {selectedFile.mimeType && (
                        <ThemedText
                          style={[styles.fileType, { color: textColor + "60" }]}
                        >
                          {selectedFile.mimeType}
                        </ThemedText>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedFile(null)}
                      style={styles.removeButton}
                      disabled={uploading}
                    >
                      <IconSymbol
                        name="xmark.circle.fill"
                        size={24}
                        color={textColor + "60"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Upload Instructions */}
            <View style={styles.instructionsSection}>
              <ThemedText
                style={[styles.instructionsTitle, { color: textColor }]}
              >
                Instrukcje
              </ThemedText>
              <ThemedText
                style={[styles.instructionsText, { color: textColor + "80" }]}
              >
                • Wybierz plik z urządzenia{"\n"}• Obsługiwane są wszystkie typy
                plików{"\n"}• Plik zostanie przesłany do chmury{"\n"}• Po
                przesłaniu będzie dostępny w liście zasobów
              </ThemedText>
            </View>

            {/* Upload Progress */}
            {uploading && (
              <View style={styles.uploadingSection}>
                <ActivityIndicator size="large" color={primaryColor} />
                <ThemedText
                  style={[styles.uploadingText, { color: textColor }]}
                >
                  Przesyłanie pliku...
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={[styles.footer, { backgroundColor: surfaceColor }]}>
          <ThemedButton
            title="Anuluj"
            variant="outline"
            size="large"
            color="primary"
            onPress={handleClose}
            disabled={uploading}
            style={styles.footerButton}
          />
          <ThemedButton
            title="Prześlij"
            variant="filled"
            size="large"
            color="primary"
            onPress={handleSubmit}
            loading={uploading}
            disabled={!selectedFile || uploading}
            style={styles.footerButton}
          />
        </View>
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
  closeButtonDisabled: {
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  pickerSection: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  pickerButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  previewSection: {
    gap: 12,
  },
  filePreview: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  filePreviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  fileIconContainer: {
    marginRight: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#00000010",
  },
  fileInfo: {
    flex: 1,
    gap: 4,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
  },
  fileSize: {
    fontSize: 14,
  },
  fileType: {
    fontSize: 12,
  },
  removeButton: {
    padding: 4,
  },
  instructionsSection: {
    gap: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 22,
  },
  uploadingSection: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  uploadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerButton: {
    flex: 1,
  },
});

export default UploadResourceModal;
