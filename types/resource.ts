export interface ResourceType {
  id: string;
  name: string;
  uploadDate?: string;
  fileSize?: number;
  fileType?: string;
}

export interface ResourceUploadRequestType {
  filename: string;
}

export interface ResourceUrlDto {
  url: string | null;
}

export interface ResourceUploadResponse {
  success: boolean;
  data?: ResourceUrlDto;
  message?: string;
}

export interface ResourceListResponse {
  success: boolean;
  data?: ResourceType[];
  message?: string;
}

export interface ResourceGroupType {
  id: string;
  name: string;
  resources: ResourceType[];
}
