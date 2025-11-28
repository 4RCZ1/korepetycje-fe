import {
  addressConverter,
  AddressDTO,
  AddressType,
} from "@/services/addressApi";
import { ApiClientError, ApiResponse, apiRequest } from "@/services/api";
import { studentApiMock } from "./mock/studentApi";

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === "true";

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

export type StudentUpdateRequestType = {
  name?: string;
  surname?: string;
  address?:
    | { id: string; name?: string } // Update existing address
    | { name: string; data?: string }; // Create new address
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

export type StudentRequestType = {
  email: string;
  phoneNumber: string;
  name: string;
  surname: string;
  address: { id: string } | { name: string; data: string };
};

type StudentUpdateRequestDTO = {
  Name?: string;
  Surname?: string;
  Address?:
    | { ExternalId: string; AddressName?: string }
    | { AddressName: string; AddressData?: string };
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

function studentUpdateRequestConverter(
  studentUpdateRequest: StudentUpdateRequestType,
): StudentUpdateRequestDTO {
  const dto: StudentUpdateRequestDTO = {};

  if (studentUpdateRequest.name !== undefined) {
    dto.Name = studentUpdateRequest.name;
  }

  if (studentUpdateRequest.surname !== undefined) {
    dto.Surname = studentUpdateRequest.surname;
  }

  if (studentUpdateRequest.address !== undefined) {
    if ("id" in studentUpdateRequest.address) {
      dto.Address = {
        ExternalId: studentUpdateRequest.address.id,
        ...(studentUpdateRequest.address.name && {
          AddressName: studentUpdateRequest.address.name,
        }),
      };
    } else {
      dto.Address = {
        AddressName: studentUpdateRequest.address.name,
        ...(studentUpdateRequest.address.data && {
          AddressData: studentUpdateRequest.address.data,
        }),
      };
    }
  }

  return dto;
}

export function studentConverter(studentDTO: StudentDTO): StudentType {
  return {
    id: studentDTO.externalId,
    name: studentDTO.name,
    surname: studentDTO.surname,
    address: addressConverter(studentDTO.address),
  };
}

const realApi = {
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
      const response = await apiRequest<string>("/auth/register-student", {
        method: "POST",
        body: JSON.stringify(studentRequestConverter(studentData)),
      });

      return response === "";
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
      const response = await apiRequest<string>(`/student/${id}`, {
        method: "DELETE",
      });

      return response === "";
    } catch (error) {
      if (error instanceof ApiClientError) {
        console.error("Failed to delete student:", error.message);
        return false;
      }
      throw error; // Re-throw unexpected errors
    }
  },

  async updateStudent(
    id: string,
    studentData: StudentUpdateRequestType,
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiRequest<string>(`/student/${id}`, {
        method: "PATCH",
        body: JSON.stringify(studentUpdateRequestConverter(studentData)),
      });
      return { data: response === "", success: true };
    } catch (error) {
      if (error instanceof ApiClientError) {
        return { data: null, success: false, message: error.message };
      }
      throw error; // Re-throw unexpected errors
    }
  },
};

export const studentApi = USE_MOCK_API ? studentApiMock : realApi;
