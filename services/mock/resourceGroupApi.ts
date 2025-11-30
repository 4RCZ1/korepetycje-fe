import { ResourceGroupType, ResourceType } from "@/types/resource";

import { ResourceGroupFilters } from "../resourceGroupApi";
import { mockDatabase } from "./mockDatabase";

export const resourceGroupApiMock = {
  async getResourceGroups(
    filters?: ResourceGroupFilters,
  ): Promise<ResourceGroupType[]> {
    console.log('[resourceGroupApiMock.getResourceGroups]', JSON.stringify({ filters }, null, 2));
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredGroups = [...mockDatabase.resourceGroups];

    if (filters?.resourceId) {
      filteredGroups = filteredGroups.filter((group) =>
        group.resources.some((r) => r.id === filters.resourceId),
      );
    }

    // Note: studentId filtering is not fully implemented in mock as we don't track assignments here
    if (filters?.studentId) {
      console.log(
        "Mock API: Filtering by studentId is not implemented in mock data",
      );
    }

    console.log('[resourceGroupApiMock.getResourceGroups] Response:', JSON.stringify(filteredGroups, null, 2));
    return filteredGroups;
  },

  async createResourceGroup(
    name: string,
    resources: ResourceType[],
  ): Promise<ResourceGroupType> {
    console.log('[resourceGroupApiMock.createResourceGroup]', JSON.stringify({ name, resources }, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newGroup: ResourceGroupType = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      resources,
    };
    mockDatabase.resourceGroups.push(newGroup);
    console.log('[resourceGroupApiMock.createResourceGroup] Response:', JSON.stringify(newGroup, null, 2));
    return newGroup;
  },

  async updateResourceGroup(
    id: string,
    name: string,
    resources: ResourceType[],
  ): Promise<ResourceGroupType> {
    console.log('[resourceGroupApiMock.updateResourceGroup]', JSON.stringify({ id, name, resources }, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockDatabase.resourceGroups.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Group not found");

    const updatedGroup = {
      ...mockDatabase.resourceGroups[index],
      name,
      resources,
    };
    mockDatabase.resourceGroups[index] = updatedGroup;
    console.log('[resourceGroupApiMock.updateResourceGroup] Response:', JSON.stringify(updatedGroup, null, 2));
    return updatedGroup;
  },

  async deleteResourceGroup(id: string): Promise<boolean> {
    console.log('[resourceGroupApiMock.deleteResourceGroup]', JSON.stringify({ id }, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 500));
    const initialLength = mockDatabase.resourceGroups.length;
    mockDatabase.resourceGroups = mockDatabase.resourceGroups.filter((g) => g.id !== id);
    return mockDatabase.resourceGroups.length < initialLength;
  },
};
