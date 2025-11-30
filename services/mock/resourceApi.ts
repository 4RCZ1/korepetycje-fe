import { ResourceType, ResourceUrlDto } from "@/types/resource";
import { mockDatabase } from "./mockDatabase";

export const resourceApiMock = {
  async beginUpload(filename: string): Promise<ResourceUrlDto> {
    console.log('[resourceApiMock.beginUpload]', JSON.stringify({ filename }, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response = { url: "https://mock-s3-url.com/upload/" + filename };
    console.log('[resourceApiMock.beginUpload] Response:', JSON.stringify(response, null, 2));
    return response;
  },

  async uploadFileToS3(
    presignedUrl: string,
    fileUri: string,
    fileType: string,
  ): Promise<boolean> {
    console.log('[resourceApiMock.uploadFileToS3]', JSON.stringify({ presignedUrl, fileUri, fileType }, null, 2));
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
    console.log('[resourceApiMock.getDownloadUrl]', JSON.stringify({ resourceGuid }, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 200));
    const response = { url: `https://mock-s3-url.com/download/${resourceGuid}` };
    console.log('[resourceApiMock.getDownloadUrl] Response:', JSON.stringify(response, null, 2));
    return response;
  },

  async getResources(): Promise<ResourceType[]> {
    console.log('[resourceApiMock.getResources]', JSON.stringify({}, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response = [...mockDatabase.resources];
    console.log('[resourceApiMock.getResources] Response:', JSON.stringify(response, null, 2));
    return response;
  },

  async deleteResource(resourceId: string): Promise<boolean> {
    console.log('[resourceApiMock.deleteResource]', JSON.stringify({ resourceId }, null, 2));
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
