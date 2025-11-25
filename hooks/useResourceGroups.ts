import { useState, useEffect, useCallback } from "react";

import {
  resourceGroupApi,
  ResourceGroupFilters,
} from "@/services/resourceGroupApi";
import { ResourceGroupType, ResourceType } from "@/types/resource";
import alert from "@/utils/alert";

export function useResourceGroups(initialFilters?: ResourceGroupFilters) {
  const [groups, setGroups] = useState<ResourceGroupType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resourceId = initialFilters?.resourceId;
  const studentId = initialFilters?.studentId;

  const fetchGroups = useCallback(
    async (filters?: ResourceGroupFilters) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await resourceGroupApi.getResourceGroups(
          filters || initialFilters,
        );
        setGroups(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Nie udało się załadować grup",
        );
        alert("Błąd", "Nie udało się załadować grup zasobów");
      } finally {
        setIsLoading(false);
      }
    },
    [resourceId, studentId],
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const addGroup = async (name: string, resources: ResourceType[]) => {
    setIsLoading(true);
    try {
      await resourceGroupApi.createResourceGroup(name, resources);
      await fetchGroups();
      return true;
    } catch (err) {
      alert("Błąd", "Nie udało się utworzyć grupy");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroup = async (
    id: string,
    name: string,
    resources: ResourceType[],
  ) => {
    setIsLoading(true);
    try {
      await resourceGroupApi.updateResourceGroup(id, name, resources);
      await fetchGroups();
      return true;
    } catch (err) {
      alert("Błąd", "Nie udało się zaktualizować grupy");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGroup = async (id: string) => {
    setIsLoading(true);
    try {
      await resourceGroupApi.deleteResourceGroup(id);
      await fetchGroups();
      return true;
    } catch (err) {
      alert("Błąd", "Nie udało się usunąć grupy");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    groups,
    isLoading,
    error,
    refreshGroups: fetchGroups,
    addGroup,
    updateGroup,
    deleteGroup,
  };
}
