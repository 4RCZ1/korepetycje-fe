import { StudentType } from "@/services/studentApi";
import { StudentGroupType } from "@/types/studentGroup";

import { StudentGroupFilters } from "../studentGroupApi";
import { mockDatabase } from "./mockDatabase";

export const studentGroupApiMock = {
  async getStudentGroups(
    filters?: StudentGroupFilters,
  ): Promise<StudentGroupType[]> {
    console.log(
      "[studentGroupApiMock.getStudentGroups]",
      JSON.stringify({ filters }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredGroups = [...mockDatabase.studentGroups];

    if (filters?.studentId) {
      filteredGroups = filteredGroups.filter((group) =>
        group.students.some((s) => s.id === filters.studentId),
      );
    }

    console.log(
      "[studentGroupApiMock.getStudentGroups] Response:",
      JSON.stringify(filteredGroups, null, 2),
    );
    return filteredGroups;
  },

  async createStudentGroup(
    name: string,
    students: StudentType[],
  ): Promise<StudentGroupType> {
    console.log(
      "[studentGroupApiMock.createStudentGroup]",
      JSON.stringify({ name, students }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newGroup: StudentGroupType = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      students,
    };
    mockDatabase.studentGroups.push(newGroup);
    console.log(
      "[studentGroupApiMock.createStudentGroup] Response:",
      JSON.stringify(newGroup, null, 2),
    );
    return newGroup;
  },

  async updateStudentGroup(
    id: string,
    name: string,
    students: StudentType[],
  ): Promise<StudentGroupType> {
    console.log(
      "[studentGroupApiMock.updateStudentGroup]",
      JSON.stringify({ id, name, students }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockDatabase.studentGroups.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Group not found");

    const updatedGroup = {
      ...mockDatabase.studentGroups[index],
      name,
      students,
    };
    mockDatabase.studentGroups[index] = updatedGroup;
    console.log(
      "[studentGroupApiMock.updateStudentGroup] Response:",
      JSON.stringify(updatedGroup, null, 2),
    );
    return updatedGroup;
  },

  async deleteStudentGroup(id: string): Promise<boolean> {
    console.log(
      "[studentGroupApiMock.deleteStudentGroup]",
      JSON.stringify({ id }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const initialLength = mockDatabase.studentGroups.length;
    mockDatabase.studentGroups = mockDatabase.studentGroups.filter(
      (g) => g.id !== id,
    );
    return mockDatabase.studentGroups.length < initialLength;
  },
};
