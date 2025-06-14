import {
  addressConverter,
  AddressDTO,
  AddressType,
} from "@/services/addressApi";
import { ApiClientError, ApiResponse, apiRequest } from "@/services/api";

type StudentDTO = {
  ExternalId: string;
  Name: string;
  Surname: string;
  Address: AddressDTO;
};

export type StudentType = {
  id: string;
  name: string;
  surname: string;
  address: AddressType;
};
export function studentConverter(studentDTO: StudentDTO): StudentType {
  return {
    id: studentDTO.ExternalId,
    name: studentDTO.Name,
    surname: studentDTO.Surname,
    address: addressConverter(studentDTO.Address),
  };
}

export const studentApi = {
  async getStudents(): Promise<ApiResponse<StudentType[]>> {
    try {
      const response = await apiRequest<StudentDTO[]>("/students");
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
      const response = await apiRequest<StudentDTO>(`/students/${id}`);
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
