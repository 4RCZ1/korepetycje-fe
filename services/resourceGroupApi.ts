import { ResourceGroupType, ResourceType } from "@/types/resource";

import { apiRequest } from "./api";
import { resourceGroupApiMock } from "./mock/resourceGroupApi";

export interface ResourceGroupFilters {
  resourceId?: string;
  studentId?: string;
}

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === "true";

const realApi = {
  async getResourceGroups(
    filters?: ResourceGroupFilters,
  ): Promise<ResourceGroupType[]> {
    const queryParams = new URLSearchParams();
    if (filters?.resourceId)
      queryParams.append("resourceId", filters.resourceId);
    if (filters?.studentId) queryParams.append("studentId", filters.studentId);

    const queryString = queryParams.toString();
    const url = `/resource-group${queryString ? `?${queryString}` : ""}`;

    const response = await apiRequest<ResourceGroupType[]>(url);
    return response;
  },

  async createResourceGroup(
    name: string,
    resources: ResourceType[],
  ): Promise<ResourceGroupType> {
    const response = await apiRequest<ResourceGroupType>("/resource-group", {
      method: "POST",
      body: JSON.stringify({ name, resources }),
    });
    return response;
  },

  async updateResourceGroup(
    id: string,
    name: string,
    resources: ResourceType[],
  ): Promise<ResourceGroupType> {
    const response = await apiRequest<ResourceGroupType>(
      `/resource-group/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({ name, resources }),
      },
    );
    return response;
  },

  async deleteResourceGroup(id: string): Promise<boolean> {
    await apiRequest(`/resource-group/${id}`, {
      method: "DELETE",
    });
    return true;
  },
};

// Export the selected implementation
export const resourceGroupApi = USE_MOCK_API ? resourceGroupApiMock : realApi;
