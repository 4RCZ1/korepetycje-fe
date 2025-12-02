import {
  StudentRequestType,
  StudentType,
  StudentUpdateRequestType,
} from "@/services/studentApi";
import { ApiResponse } from "@/services/api";
import { mockDatabase } from "./mockDatabase";

export const studentApiMock = {
  async getStudents(): Promise<ApiResponse<StudentType[]>> {
    console.log('[studentApiMock.getStudents]', JSON.stringify({}, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 500));
    const response = { data: [...mockDatabase.students], success: true };
    console.log('[studentApiMock.getStudents] Response:', JSON.stringify(response, null, 2));
    return response;
  },

  async getStudentById(id: string): Promise<ApiResponse<StudentType>> {
    console.log('[studentApiMock.getStudentById]', JSON.stringify({ id }, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 500));
    const student = mockDatabase.students.find((s) => s.id === id);
    if (!student) {
      const response = { data: null, success: false, message: "Student not found" };
      console.log('[studentApiMock.getStudentById] Response:', JSON.stringify(response, null, 2));
      return response;
    }
    const response = { data: student, success: true };
    console.log('[studentApiMock.getStudentById] Response:', JSON.stringify(response, null, 2));
    return response;
  },

  async addStudent(studentData: StudentRequestType): Promise<boolean> {
    console.log('[studentApiMock.addStudent]', JSON.stringify({ studentData }, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newStudent: StudentType = {
      id: Math.random().toString(36).substring(2, 11),
      name: studentData.name,
      surname: studentData.surname,
      address: {
        id: "id" in studentData.address ? studentData.address.id : Math.random().toString(36).substring(2, 11),
        name: "id" in studentData.address ? "Existing Address" : studentData.address.name,
        data: "id" in studentData.address ? "" : studentData.address.data,
      },
    };

    mockDatabase.students.push(newStudent);
    return true;
  },

  async deleteStudent(id: string): Promise<boolean> {
    console.log('[studentApiMock.deleteStudent]', JSON.stringify({ id }, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 500));
    const initialLength = mockDatabase.students.length;
    mockDatabase.students = mockDatabase.students.filter((s) => s.id !== id);
    
    // Also remove student from any groups they are in
    mockDatabase.studentGroups.forEach(group => {
        group.students = group.students.filter(s => s.id !== id);
    });

    return mockDatabase.students.length < initialLength;
  },

  async updateStudent(
    id: string,
    studentData: StudentUpdateRequestType,
  ): Promise<ApiResponse<boolean>> {
    console.log('[studentApiMock.updateStudent]', JSON.stringify({ id, studentData }, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockDatabase.students.findIndex((s) => s.id === id);
    
    if (index === -1) {
      return { data: false, success: false, message: "Student not found" };
    }

    const currentStudent = mockDatabase.students[index];
    const updatedStudent: StudentType = {
      ...currentStudent,
      name: studentData.name ?? currentStudent.name,
      surname: studentData.surname ?? currentStudent.surname,
      address: studentData.address 
        ? {
            id: "id" in studentData.address ? studentData.address.id : currentStudent.address.id,
            name: "name" in studentData.address ? studentData.address.name! : currentStudent.address.name,
            data: "data" in studentData.address ? studentData.address.data! : currentStudent.address.data,
          }
        : currentStudent.address,
    };

    mockDatabase.students[index] = updatedStudent;
    
    // Update student in groups as well to keep consistency
    mockDatabase.studentGroups.forEach(group => {
        const studentIndex = group.students.findIndex(s => s.id === id);
        if (studentIndex !== -1) {
            group.students[studentIndex] = updatedStudent;
        }
    });

    return { data: true, success: true };
  },
};
