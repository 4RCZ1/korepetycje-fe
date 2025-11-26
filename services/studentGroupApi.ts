import { apiRequest } from "./api";
import { StudentType } from "./studentApi";
import { StudentGroupType } from "@/types/studentGroup";
import { studentGroupApiMock } from "./mock/studentGroupApi";

export interface StudentGroupFilters {
  studentId?: string;
}

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === "true";

const realApi = {
  async getStudentGroups(
    filters?: StudentGroupFilters,
  ): Promise<StudentGroupType[]> {
    const queryParams = new URLSearchParams();
    if (filters?.studentId) queryParams.append("studentId", filters.studentId);

    const queryString = queryParams.toString();
    const url = `/student-group${queryString ? `?${queryString}` : ""}`;

    const response = await apiRequest<StudentGroupType[]>(url);
    return response;
  },

  async createStudentGroup(
    name: string,
    students: StudentType[],
  ): Promise<StudentGroupType> {
    const response = await apiRequest<StudentGroupType>("/student-group", {
      method: "POST",
      body: JSON.stringify({ name, students }),
    });
    return response;
  },

  async updateStudentGroup(
    id: string,
    name: string,
    students: StudentType[],
  ): Promise<StudentGroupType> {
    const response = await apiRequest<StudentGroupType>(
      `/student-group/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({ name, students }),
      },
    );
    return response;
  },

  async deleteStudentGroup(id: string): Promise<boolean> {
    await apiRequest(`/student-group/${id}`, {
      method: "DELETE",
    });
    return true;
  },
};

export const studentGroupApi = USE_MOCK_API ? studentGroupApiMock : realApi;
