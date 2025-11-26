import { ResourceType, ResourceUrlDto } from "@/types/resource";
import { mockDatabase } from "./mockDatabase";

export const resourceApiMock = {
  async beginUpload(filename: string): Promise<ResourceUrlDto> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { url: "https://mock-s3-url.com/upload/" + filename };
  },

  async uploadFileToS3(
    presignedUrl: string,
    fileUri: string,
    fileType: string,
  ): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Extract filename from the mock URL or generate one
    const filename = presignedUrl.split("/").pop() || "uploaded-file";
    
    const newResource: ResourceType = {
      id: Math.random().toString(36).substring(2, 11),
      name: filename,
      uploadDate: new Date().toISOString(),
      fileSize: 1024 * 1024, // Mock size 1MB
      fileType: fileType,
    };

    mockDatabase.resources.push(newResource);
    return true;
  },

  async getDownloadUrl(resourceGuid: string): Promise<ResourceUrlDto> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { url: `https://mock-s3-url.com/download/${resourceGuid}` };
  },

  async getResources(): Promise<ResourceType[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...mockDatabase.resources];
  },

  async deleteResource(resourceId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const initialLength = mockDatabase.resources.length;
    mockDatabase.resources = mockDatabase.resources.filter((r) => r.id !== resourceId);
    
    // Also remove resource from any groups
    mockDatabase.resourceGroups.forEach(group => {
        group.resources = group.resources.filter(r => r.id !== resourceId);
    });

    return mockDatabase.resources.length < initialLength;
  },
};
