import { ResourceGroupType, ResourceType } from "@/types/resource";

import { ResourceGroupFilters } from "../resourceGroupApi";

let mockResourceGroups: ResourceGroupType[] = [
  {
    id: "1",
    name: "Materiały startowe",
    resources: [],
  },
  {
    id: "2",
    name: "Egzaminy ósmoklasisty",
    resources: [],
  },
];

export const resourceGroupApiMock = {
  async getResourceGroups(
    filters?: ResourceGroupFilters,
  ): Promise<ResourceGroupType[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredGroups = [...mockResourceGroups];

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

    return filteredGroups;
  },

  async createResourceGroup(
    name: string,
    resources: ResourceType[],
  ): Promise<ResourceGroupType> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newGroup: ResourceGroupType = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      resources,
    };
    mockResourceGroups.push(newGroup);
    return newGroup;
  },

  async updateResourceGroup(
    id: string,
    name: string,
    resources: ResourceType[],
  ): Promise<ResourceGroupType> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockResourceGroups.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Group not found");

    const updatedGroup = {
      ...mockResourceGroups[index],
      name,
      resources,
    };
    mockResourceGroups[index] = updatedGroup;
    return updatedGroup;
  },

  async deleteResourceGroup(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    mockResourceGroups = mockResourceGroups.filter((g) => g.id !== id);
    return true;
  },
};
