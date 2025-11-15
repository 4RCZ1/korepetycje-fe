import { apiRequest } from "./api";
import {
  ResourceUploadRequestType,
  ResourceUrlDto,
  ResourceType,
} from "@/types/resource";

/**
 * Begin upload process - get presigned URL from backend
 */
export async function beginUpload(
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

/**
 * Upload file directly to S3 using presigned URL
 */
export async function uploadFileToS3(
  presignedUrl: string,
  fileUri: string,
  fileType: string,
): Promise<boolean> {
  try {
    // Fetch the file as a blob
    const fileBlob = await fetch(fileUri).then((res) => res.blob());

    // Upload to S3 using presigned URL
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: fileBlob,
      headers: {
        "Content-Type": fileType,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error(`S3 upload failure: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get download URL for a resource
 */
export async function getDownloadUrl(
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

/**
 * Get all resources (mock implementation - adjust based on actual backend)
 */
export async function getResources(): Promise<ResourceType[]> {
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

/**
 * Delete a resource (mock implementation - adjust based on actual backend)
 */
export async function deleteResource(resourceId: string): Promise<boolean> {
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

export const resourceApi = {
  beginUpload,
  uploadFileToS3,
  getDownloadUrl,
  getResources,
  deleteResource,
};
