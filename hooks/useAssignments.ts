import { useState, useCallback } from "react";

import {
  assignmentApi,
  CreateAssignmentRequest,
  DeleteAssignmentRequest,
  ResourceAssignmentsResponse,
  ResourceGroupAssignmentsResponse,
  StudentAssignmentsResponse,
  StudentGroupAssignmentsResponse,
} from "@/services/assignmentApi";
import alert from "@/utils/alert";

export function useAssignments() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAssignments = useCallback(
    async (request: CreateAssignmentRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await assignmentApi.createAssignments(request);
        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Nie udało się utworzyć przypisań";
        setError(message);
        alert("Błąd", message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteAssignment = useCallback(
    async (assignmentId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await assignmentApi.deleteAssignment(assignmentId);
        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Nie udało się usunąć przypisania";
        setError(message);
        alert("Błąd", message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteAssignments = useCallback(
    async (assignmentIds: string[]): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await assignmentApi.deleteAssignments(assignmentIds);
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Nie udało się usunąć przypisań";
        setError(message);
        alert("Błąd", message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteAssignmentsBulk = useCallback(
    async (request: DeleteAssignmentRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await assignmentApi.deleteAssignmentsBulk(request);
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Nie udało się usunąć przypisań";
        setError(message);
        alert("Błąd", message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getResourceAssignments = useCallback(
    async (resourceId: string): Promise<ResourceAssignmentsResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await assignmentApi.getResourceAssignments(resourceId);
        return response;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Nie udało się pobrać przypisań zasobu";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getResourceGroupAssignments = useCallback(
    async (
      resourceGroupId: string,
    ): Promise<ResourceGroupAssignmentsResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response =
          await assignmentApi.getResourceGroupAssignments(resourceGroupId);
        return response;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Nie udało się pobrać przypisań grupy zasobów";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getStudentAssignments = useCallback(
    async (studentId: string): Promise<StudentAssignmentsResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await assignmentApi.getStudentAssignments(studentId);
        return response;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Nie udało się pobrać przypisań ucznia";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getStudentGroupAssignments = useCallback(
    async (
      studentGroupId: string,
    ): Promise<StudentGroupAssignmentsResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response =
          await assignmentApi.getStudentGroupAssignments(studentGroupId);
        return response;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Nie udało się pobrać przypisań grupy uczniów";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    isLoading,
    error,
    createAssignments,
    deleteAssignment,
    deleteAssignments,
    deleteAssignmentsBulk,
    getResourceAssignments,
    getResourceGroupAssignments,
    getStudentAssignments,
    getStudentGroupAssignments,
  };
}
