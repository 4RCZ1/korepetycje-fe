import { useState, useEffect, useCallback } from "react";

import { AddressType } from "@/services/addressApi";
import { ApiClientError } from "@/services/api";
import {
  studentApi,
  StudentType,
  StudentUpdateRequestType,
  StudentRequestType,
} from "@/services/studentApi";

export interface UseStudentApiState {
  students: StudentType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteStudent: (studentId: string) => Promise<boolean>;
  addStudent: (studentData: StudentRequestType) => Promise<boolean>;
  updateStudent: (
    studentId: string,
    studentData: StudentUpdateRequestType,
  ) => Promise<boolean>;
  deletingStudents: Set<string>;
  updatingStudents: Set<string>;
}

export function useStudentApi(
  fetchOnRender: boolean = true,
): UseStudentApiState {
  const [students, setStudents] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingStudents, setDeletingStudents] = useState<Set<string>>(
    new Set(),
  );
  const [updatingStudents, setUpdatingStudents] = useState<Set<string>>(
    new Set(),
  );

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await studentApi.getStudents();
      if (response.success && response.data) {
        setStudents(response.data);
      } else {
        setError(response.message || "Failed to load students");
      }
    } catch (err) {
      const apiError = err as ApiClientError;

      // Provide user-friendly error messages
      let errorMessage = "Failed to load students";

      if (apiError.code === "NETWORK_ERROR") {
        errorMessage = "No internet connection. Please check your network.";
      } else if (apiError.code === "TIMEOUT") {
        errorMessage = "Request timed out. Please try again.";
      } else if (apiError.status === 401) {
        errorMessage = "Authentication required. Please log in.";
      } else if (apiError.status === 403) {
        errorMessage = "Access denied. You don't have permission.";
      } else if (apiError.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      setError(errorMessage);
      console.error("Students fetch error:", apiError);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStudent = useCallback(
    async (studentId: string): Promise<boolean> => {
      try {
        // Add to deleting set for loading state
        setDeletingStudents((prev) => new Set(prev).add(studentId));
        setError(null);

        const result = await studentApi.deleteStudent(studentId);

        if (!result) {
          setError("Failed to delete student");
          return false;
        }
        // Optimistically update local state
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student.id !== studentId),
        );
        // Refresh the student list to ensure data consistency
        await fetchStudents();
        return true;
      } catch (err) {
        const apiError = err as ApiClientError;

        let errorMessage = "Failed to delete student";

        if (apiError.code === "NETWORK_ERROR") {
          errorMessage = "No internet connection. Changes not saved.";
        } else if (apiError.status === 409) {
          errorMessage = "Student data was changed. Refreshing...";
          // Refresh data on conflict
          fetchStudents();
        }

        setError(errorMessage);
        console.error("Student deletion error:", apiError);
        return false;
      } finally {
        // Remove from deleting set
        setDeletingStudents((prev) => {
          const newSet = new Set(prev);
          newSet.delete(studentId);
          return newSet;
        });
      }
    },
    [fetchStudents],
  );

  const addStudent = useCallback(
    async (studentData: StudentRequestType): Promise<boolean> => {
      try {
        setError(null);

        const result = await studentApi.addStudent(studentData);

        if (result) {
          // Refresh the student list to get the updated data with the new student
          await fetchStudents();
          return true;
        } else {
          setError("Failed to create student");
          return false;
        }
      } catch (err) {
        const apiError = err as ApiClientError;

        let errorMessage = "Failed to create student";

        if (apiError.code === "NETWORK_ERROR") {
          errorMessage = "No internet connection. Student not created.";
        } else if (apiError.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }

        setError(errorMessage);
        console.error("Student creation error:", apiError);
        return false;
      }
    },
    [fetchStudents],
  );

  const updateStudent = useCallback(
    async (
      studentId: string,
      studentData: StudentUpdateRequestType,
    ): Promise<boolean> => {
      try {
        // Add to updating set for loading state
        setUpdatingStudents((prev) => new Set(prev).add(studentId));
        setError(null);

        const result = await studentApi.updateStudent(studentId, studentData);

        if (result.success && result.data) {
          // Optimistic update of local state
          setStudents((prevStudents) =>
            prevStudents.map((student) => {
              if (student.id === studentId) {
                studentData.address = {
                  ...student.address,
                  ...studentData.address,
                } as AddressType;
                return {
                  ...student,
                  ...(studentData as StudentType),
                };
              }
              return student;
            }),
          );
          return true;
        } else {
          setError(result.message || "Failed to update student");
          return false;
        }
      } catch (err) {
        const apiError = err as ApiClientError;

        let errorMessage = "Failed to update student";

        if (apiError.code === "NETWORK_ERROR") {
          errorMessage = "No internet connection. Changes not saved.";
        } else if (apiError.status === 409) {
          errorMessage = "Student data was changed. Refreshing...";
          // Refresh data on conflict
          fetchStudents();
        }

        setError(errorMessage);
        console.error("Student update error:", apiError);
        return false;
      } finally {
        // Remove from updating set
        setUpdatingStudents((prev) => {
          const newSet = new Set(prev);
          newSet.delete(studentId);
          return newSet;
        });
      }
    },
    [fetchStudents],
  );

  // Initial data fetch
  useEffect(() => {
    if (!fetchOnRender) return;
    fetchStudents();
  }, [fetchOnRender, fetchStudents]);

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
    deleteStudent,
    addStudent,
    updateStudent,
    deletingStudents,
    updatingStudents,
  };
}
