import { apiRequest } from "./api";
import { StudentDTO, studentConverter, StudentType } from "./studentApi";
import { StudentGroupType } from "@/types/studentGroup";
import { studentGroupApiMock } from "./mock/studentGroupApi";

export interface StudentGroupFilters {
  studentId?: string;
}

// DTO types matching backend API format
type StudentGroupDTO = {
  externalId: string;
  name: string;
  students: StudentDTO[];
};

type StudentGroupRequestDTO = {
  name: string;
  studentIds: string[];
};

// Converters
function studentGroupConverter(dto: StudentGroupDTO): StudentGroupType {
  return {
    id: dto.externalId,
    name: dto.name,
    students: dto.students.map(studentConverter),
  };
}

function studentGroupRequestConverter(
  name: string,
  students: StudentType[],
): StudentGroupRequestDTO {
  return {
    name,
    studentIds: students.map((s) => s.id),
  };
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

    const response = await apiRequest<StudentGroupDTO[]>(url);
    return response.map(studentGroupConverter);
  },

  async createStudentGroup(
    name: string,
    students: StudentType[],
  ): Promise<StudentGroupType> {
    const requestDto = studentGroupRequestConverter(name, students);
    const response = await apiRequest<StudentGroupDTO>("/student-group", {
      method: "POST",
      body: JSON.stringify(requestDto),
    });
    return studentGroupConverter(response);
  },

  async updateStudentGroup(
    id: string,
    name: string,
    students: StudentType[],
  ): Promise<StudentGroupType> {
    const requestDto = studentGroupRequestConverter(name, students);
    const response = await apiRequest<StudentGroupDTO>(
      `/student-group/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(requestDto),
      },
    );
    return studentGroupConverter(response);
  },

  async deleteStudentGroup(id: string): Promise<boolean> {
    await apiRequest(`/student-group/${id}`, {
      method: "DELETE",
    });
    return true;
  },
};

export const studentGroupApi = USE_MOCK_API ? studentGroupApiMock : realApi;
