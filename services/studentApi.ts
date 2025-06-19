import {
  addressConverter,
  AddressDTO,
  AddressType,
} from "@/services/addressApi";
import { ApiClientError, ApiResponse, apiRequest } from "@/services/api";

type StudentDTO = {
  externalId: string;
  email: string;
  phoneNumber: string;
  name: string;
  surname: string;
  address: AddressDTO;
};

export type StudentType = {
  id: string;
  name: string;
  surname: string;
  address: AddressType;
};

type StudentRequestDTO = {
  email: string;
  phoneNumber: string;
  name: string;
  surname: string;
  address:
    | { externalId: string }
    | { addressName: string; addressData: string };
};

type StudentRequestType = {
  email: string;
  phoneNumber: string;
  name: string;
  surname: string;
  address: { id: string } | { name: string; data: string };
};

function studentRequestConverter(
  studentRequest: StudentRequestType,
): StudentRequestDTO {
  return {
    email: studentRequest.email,
    phoneNumber: studentRequest.phoneNumber,
    name: studentRequest.name,
    surname: studentRequest.surname,
    address:
      "id" in studentRequest.address
        ? { externalId: studentRequest.address.id }
        : {
            addressName: studentRequest.address.name,
            addressData: studentRequest.address.data,
          },
  };
}

export function studentConverter(studentDTO: StudentDTO): StudentType {
  return {
    id: studentDTO.externalId,
    name: studentDTO.name,
    surname: studentDTO.surname,
    address: addressConverter(studentDTO.address),
  };
}

export const studentApi = {
  async getStudents(): Promise<ApiResponse<StudentType[]>> {
    try {
      const response = await apiRequest<StudentDTO[]>("/student");
      const students = response.map(studentConverter);
      return { data: students, success: true };
    } catch (error) {
      if (error instanceof ApiClientError) {
        return { data: [], success: false, message: error.message };
      }
      throw error; // Re-throw unexpected errors
    }
  },

  async getStudentById(id: string): Promise<ApiResponse<StudentType>> {
    try {
      const response = await apiRequest<StudentDTO>(`/student/${id}`);
      const student = studentConverter(response);
      return { data: student, success: true };
    } catch (error) {
      if (error instanceof ApiClientError) {
        return { data: null, success: false, message: error.message };
      }
      throw error; // Re-throw unexpected errors
    }
  },

  async addStudent(studentData: StudentRequestType): Promise<boolean> {
    try {
      const response = await apiRequest<boolean>("/auth/register-student", {
        method: "POST",
        body: JSON.stringify(studentRequestConverter(studentData)),
      });

      return response ? true : false;
    } catch (error) {
      if (error instanceof ApiClientError) {
        console.error("Failed to add student:", error.message);
        return false;
      }
      throw error; // Re-throw unexpected errors
    }
  },

  async deleteStudent(id: string): Promise<boolean> {
    try {
      const response = await apiRequest(`/student/${id}`, {
        method: "DELETE",
      });

      return response ? true : false;
    } catch (error) {
      if (error instanceof ApiClientError) {
        console.error("Failed to delete student:", error.message);
        return false;
      }
      throw error; // Re-throw unexpected errors
    }
  },
};
