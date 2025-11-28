import { StudentType } from "@/services/studentApi";

export interface StudentGroupType {
  id: string;
  name: string;
  students: StudentType[];
}
