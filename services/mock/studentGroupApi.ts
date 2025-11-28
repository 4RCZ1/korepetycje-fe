import { StudentGroupType } from "@/types/studentGroup";
import { StudentType } from "@/services/studentApi";
import { StudentGroupFilters } from "../studentGroupApi";
import { mockDatabase } from "./mockDatabase";

export const studentGroupApiMock = {
  async getStudentGroups(
    filters?: StudentGroupFilters,
  ): Promise<StudentGroupType[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredGroups = [...mockDatabase.studentGroups];

    if (filters?.studentId) {
       filteredGroups = filteredGroups.filter((group) =>
        group.students.some((s) => s.id === filters.studentId),
      );
    }

    return filteredGroups;
  },

  async createStudentGroup(
    name: string,
    students: StudentType[],
  ): Promise<StudentGroupType> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newGroup: StudentGroupType = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      students,
    };
    mockDatabase.studentGroups.push(newGroup);
    return newGroup;
  },

  async updateStudentGroup(
    id: string,
    name: string,
    students: StudentType[],
  ): Promise<StudentGroupType> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockDatabase.studentGroups.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Group not found");

    const updatedGroup = {
      ...mockDatabase.studentGroups[index],
      name,
      students,
    };
    mockDatabase.studentGroups[index] = updatedGroup;
    return updatedGroup;
  },

  async deleteStudentGroup(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const initialLength = mockDatabase.studentGroups.length;
    mockDatabase.studentGroups = mockDatabase.studentGroups.filter((g) => g.id !== id);
    return mockDatabase.studentGroups.length < initialLength;
  },
};
