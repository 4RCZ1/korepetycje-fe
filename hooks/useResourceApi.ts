import { useState, useEffect, useCallback } from "react";
import * as DocumentPicker from "expo-document-picker";

import { ResourceType } from "@/types/resource";
import { resourceApi } from "@/services/resourceApi";
import alert from "@/utils/alert";

export function useResourceApi() {
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingResources, setDeletingResources] = useState<Set<string>>(
    new Set(),
  );

  // Fetch resources on mount
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resourceApi.getResources();
      setResources(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Nie udało się pobrać zasobów";
      setError(errorMessage);
      console.error("Error fetching resources:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchResources();
  }, [fetchResources]);

  /**
   * Upload a resource - handles the full two-step process
   */
  const uploadResource = useCallback(
    async (file: DocumentPicker.DocumentPickerAsset): Promise<boolean> => {
      setUploading(true);
      setError(null);
      try {
        // Step 1: Get presigned URL from backend
        console.log("Getting presigned URL for:", file.name);
        const urlResponse = await resourceApi.beginUpload(file.name);

        if (!urlResponse.url) {
          throw new Error("Nie otrzymano URL do przesłania pliku");
        }

        // Step 2: Upload file to S3
        console.log("Uploading file to S3...");
        const uploadSuccess = await resourceApi.uploadFileToS3(
          urlResponse.url,
          file.uri,
          file.mimeType || "application/octet-stream",
        );

        if (!uploadSuccess) {
          throw new Error("Nie udało się przesłać pliku");
        }

        // Step 3: Refresh resource list
        await fetchResources();

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Nie udało się przesłać pliku";
        setError(errorMessage);
        console.error("Error uploading resource:", err);
        return false;
      } finally {
        setUploading(false);
      }
    },
    [fetchResources],
  );

  /**
   * Delete a resource
   */
  const deleteResource = useCallback(
    async (resourceId: string): Promise<boolean> => {
      setDeletingResources((prev) => new Set(prev).add(resourceId));
      try {
        const success = await resourceApi.deleteResource(resourceId);
        if (success) {
          setResources((prev) =>
            prev.filter((resource) => resource.id !== resourceId),
          );
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Nie udało się usunąć zasobu";
        alert("Błąd", errorMessage);
        console.error("Error deleting resource:", err);
        return false;
      } finally {
        setDeletingResources((prev) => {
          const next = new Set(prev);
          next.delete(resourceId);
          return next;
        });
      }
    },
    [],
  );

  /**
   * Get download URL for a resource
   */
  const getResourceDownloadUrl = useCallback(
    async (resourceId: string): Promise<string | null> => {
      try {
        const urlResponse = await resourceApi.getDownloadUrl(resourceId);
        return urlResponse.url;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Nie udało się pobrać URL pobierania";
        alert("Błąd", errorMessage);
        console.error("Error getting download URL:", err);
        return null;
      }
    },
    [],
  );

  return {
    resources,
    loading,
    uploading,
    error,
    deletingResources,
    refetch,
    uploadResource,
    deleteResource,
    getResourceDownloadUrl,
  };
}
