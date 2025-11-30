import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  View,
} from "react-native";

import ResourceCard from "@/components/Resources/ResourceCard";
import UploadResourceModal from "@/components/Resources/UploadResourceModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedButton from "@/components/ui/ThemedButton";
import { useAuth } from "@/hooks/useAuth";
import { useResourceApi } from "@/hooks/useResourceApi";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function ResourcesScreen() {
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const { isTutor } = useAuth();
  const viewMode = isTutor() ? "tutor" : "student";

  const {
    resources,
    loading,
    error,
    refetch,
    uploadResource,
    deleteResource,
    getResourceDownloadUrl,
    deletingResources,
  } = useResourceApi();

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error", "500");

  const handleUploadResource = async (
    file: DocumentPicker.DocumentPickerAsset,
  ): Promise<boolean> => {
    return await uploadResource(file);
  };

  const handleDeleteResource = async (resourceId: string): Promise<boolean> => {
    return await deleteResource(resourceId);
  };

  const handleDownloadResource = async (
    resourceId: string,
  ): Promise<string | null> => {
    return await getResourceDownloadUrl(resourceId);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (loading && resources.length === 0) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            Zasoby
          </ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Ładowanie zasobów...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          {isTutor() ? "Zasoby" : "Moje Zasoby"}
        </ThemedText>
        {isTutor() && (
          <ThemedButton
            title="Prześlij"
            variant="filled"
            size="medium"
            color="primary"
            onPress={() => setIsUploadModalVisible(true)}
          />
        )}
      </View>

      {error && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: errorColor + "20" },
          ]}
        >
          <ThemedText style={[styles.errorText, { color: errorColor }]}>
            {error}
          </ThemedText>
          <ThemedButton
            title="Ponów"
            variant="outline"
            size="small"
            color="error"
            onPress={handleRefresh}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {resources.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
              {isTutor()
                ? "Nie masz jeszcze zasobów"
                : "Nie masz żadnych przypisanych zasobów"}
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: textColor + "80" }]}>
              {isTutor()
                ? "Prześlij pierwszy plik, aby rozpocząć"
                : "Twój korepetytor jeszcze nie przypisał Ci żadnych materiałów"}
            </ThemedText>
            {isTutor() && (
              <ThemedButton
                title="Prześlij Zasób"
                variant="filled"
                size="large"
                color="primary"
                onPress={() => setIsUploadModalVisible(true)}
                style={styles.emptyButton}
              />
            )}
          </View>
        ) : (
          <View style={styles.resourcesContainer}>
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onDelete={isTutor() ? handleDeleteResource : undefined}
                onDownload={handleDownloadResource}
                isDeleting={deletingResources.has(resource.id)}
                viewMode={viewMode}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {isTutor() && (
        <UploadResourceModal
          visible={isUploadModalVisible}
          onClose={() => setIsUploadModalVisible(false)}
          onSubmit={handleUploadResource}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60, // Account for status bar
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 8,
  },
  resourcesContainer: {
    paddingTop: 8,
  },
});
