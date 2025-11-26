import { StudentGroupType } from "@/types/studentGroup";
import { StudentType } from "@/services/studentApi";
import { StudentGroupFilters } from "../studentGroupApi";

let mockStudentGroups: StudentGroupType[] = [
  {
    id: "1",
    name: "Klasa 3A",
    students: [],
  },
  {
    id: "2",
    name: "Grupa zaawansowana",
    students: [],
  },
];

export const studentGroupApiMock = {
  async getStudentGroups(
    filters?: StudentGroupFilters,
  ): Promise<StudentGroupType[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredGroups = [...mockStudentGroups];

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
    mockStudentGroups.push(newGroup);
    return newGroup;
  },

  async updateStudentGroup(
    id: string,
    name: string,
    students: StudentType[],
  ): Promise<StudentGroupType> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockStudentGroups.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Group not found");

    const updatedGroup = {
      ...mockStudentGroups[index],
      name,
      students,
    };
    mockStudentGroups[index] = updatedGroup;
    return updatedGroup;
  },

  async deleteStudentGroup(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    mockStudentGroups = mockStudentGroups.filter((g) => g.id !== id);
    return true;
  },
};
