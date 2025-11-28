import { StudentType } from "@/services/studentApi";
import { ResourceGroupType, ResourceType } from "@/types/resource";
import { StudentGroupType } from "@/types/studentGroup";

// Initial Mock Data

const initialStudents: StudentType[] = [
  {
    id: "s1",
    name: "Jan",
    surname: "Kowalski",
    address: {
      id: "a1",
      name: "Dom",
      data: "ul. Polna 1, 00-001 Warszawa",
    },
  },
  {
    id: "s2",
    name: "Anna",
    surname: "Nowak",
    address: {
      id: "a2",
      name: "Mieszkanie",
      data: "ul. Leśna 5/10, 00-002 Kraków",
    },
  },
  {
    id: "s3",
    name: "Piotr",
    surname: "Wiśniewski",
    address: {
      id: "a3",
      name: "Dom",
      data: "ul. Słoneczna 15, 00-003 Gdańsk",
    },
  },
];

const initialResources: ResourceType[] = [
  {
    id: "r1",
    name: "Matematyka - Zestaw 1.pdf",
    uploadDate: new Date().toISOString(),
    fileSize: 1024 * 1024 * 1.5, // 1.5 MB
    fileType: "application/pdf",
  },
  {
    id: "r2",
    name: "Fizyka - Wzory.docx",
    uploadDate: new Date().toISOString(),
    fileSize: 1024 * 500, // 500 KB
    fileType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  {
    id: "r3",
    name: "Fizyka - Wzory 2.docx",
  },
];

const initialStudentGroups: StudentGroupType[] = [
  {
    id: "g1",
    name: "Klasa 3A - Matematyka",
    students: [initialStudents[0]], // Jan Kowalski
  },
];

const initialResourceGroups: ResourceGroupType[] = [
  {
    id: "rg1",
    name: "Materiały startowe",
    resources: [initialResources[0]],
  },
];

// Central Mock Database
export const mockDatabase = {
  students: [...initialStudents],
  studentGroups: [...initialStudentGroups],
  resourceGroups: [...initialResourceGroups],
  resources: [...initialResources],
};
