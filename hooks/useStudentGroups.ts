import { useState, useEffect, useCallback } from "react";

import {
  studentGroupApi,
  StudentGroupFilters,
} from "@/services/studentGroupApi";
import { StudentType } from "@/services/studentApi";
import { StudentGroupType } from "@/types/studentGroup";
import alert from "@/utils/alert";

export function useStudentGroups(initialFilters?: StudentGroupFilters) {
  const [groups, setGroups] = useState<StudentGroupType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentId = initialFilters?.studentId;

  const fetchGroups = useCallback(
    async (filters?: StudentGroupFilters) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await studentGroupApi.getStudentGroups(
          filters || initialFilters,
        );
        setGroups(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Nie udało się załadować grup uczniów",
        );
        alert("Błąd", "Nie udało się załadować grup uczniów");
      } finally {
        setIsLoading(false);
      }
    },
    [studentId],
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const addGroup = async (name: string, students: StudentType[]) => {
    setIsLoading(true);
    try {
      await studentGroupApi.createStudentGroup(name, students);
      await fetchGroups();
      return true;
    } catch (err) {
      alert("Błąd", "Nie udało się utworzyć grupy uczniów");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroup = async (
    id: string,
    name: string,
    students: StudentType[],
  ) => {
    setIsLoading(true);
    try {
      await studentGroupApi.updateStudentGroup(id, name, students);
      await fetchGroups();
      return true;
    } catch (err) {
      alert("Błąd", "Nie udało się zaktualizować grupy uczniów");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGroup = async (id: string) => {
    setIsLoading(true);
    try {
      await studentGroupApi.deleteStudentGroup(id);
      await fetchGroups();
      return true;
    } catch (err) {
      alert("Błąd", "Nie udało się usunąć grupy uczniów");
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
