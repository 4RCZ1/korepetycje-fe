import { apiRequest } from "./api";
import {
  ResourceUploadRequestType,
  ResourceUrlDto,
  ResourceType,
} from "@/types/resource";
import { resourceApiMock } from "./mock/resourceApi";

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === "true";

/**
 * Begin upload process - get presigned URL from backend
 */
async function beginUploadReal(
  filename: string,
): Promise<ResourceUrlDto> {
  const requestBody: ResourceUploadRequestType = { filename };
  const response = await apiRequest<ResourceUrlDto>(
    "/resource/",
    {
      method: "POST",
      body: JSON.stringify(requestBody),
    },
  );
  return response;
}

export const beginUpload = USE_MOCK_API ? resourceApiMock.beginUpload : beginUploadReal;

/**
 * Upload file directly to S3 using presigned URL
 */
async function uploadFileToS3Real(
  presignedUrl: string,
  fileUri: string,
  fileType: string,
): Promise<boolean> {
  try {
    // Fetch the file as a blob
    const fileBlob = await fetch(fileUri).then((res) => res.blob());

    // Upload to S3 using presigned URL
    // Note: Don't include Content-Type header unless it was specified when generating the presigned URL
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: fileBlob,
    });

    return response.ok;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error(`S3 upload failure: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const uploadFileToS3 = USE_MOCK_API ? resourceApiMock.uploadFileToS3 : uploadFileToS3Real;

/**
 * Get download URL for a resource
 */
async function getDownloadUrlReal(
  resourceGuid: string,
): Promise<ResourceUrlDto> {
  const response = await apiRequest<ResourceUrlDto>(
    `/resource/${resourceGuid}`,
    {
      method: "GET",
    },
  );
  return response;
}

export const getDownloadUrl = USE_MOCK_API ? resourceApiMock.getDownloadUrl : getDownloadUrlReal;

/**
 * Get all resources (mock implementation - adjust based on actual backend)
 */
async function getResourcesReal(): Promise<ResourceType[]> {
  try {
    const response = await apiRequest<ResourceType[]>(
      "/resource/list",
      {
        method: "GET",
      },
    );
    return response;
  } catch (error) {
    console.error("Error fetching resources:", error);
    // Return empty array if endpoint doesn't exist yet
    return [];
  }
}

export const getResources = USE_MOCK_API ? resourceApiMock.getResources : getResourcesReal;

/**
 * Delete a resource (mock implementation - adjust based on actual backend)
 */
async function deleteResourceReal(resourceId: string): Promise<boolean> {
  try {
    await apiRequest(
      `/resource/${resourceId}`,
      {
        method: "DELETE",
      },
    );
    return true;
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw error;
  }
}

export const deleteResource = USE_MOCK_API ? resourceApiMock.deleteResource : deleteResourceReal;

export const resourceApi = {
  beginUpload,
  uploadFileToS3,
  getDownloadUrl,
  getResources,
  deleteResource,
};
