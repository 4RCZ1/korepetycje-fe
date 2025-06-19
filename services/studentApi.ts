import {
  addressConverter,
  AddressDTO,
  AddressType,
} from "@/services/addressApi";
import { ApiClientError, ApiResponse, apiRequest } from "@/services/api";

type StudentDTO = {
  externalId: string;
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
};
