import { StudentType } from "@/services/studentApi";

import { ResourceType } from "./resource";

export enum AssignmentType {
  DIRECT = "direct",
  STUDENT_GROUP = "student-group",
  RESOURCE_GROUP = "resource-group",
}

export interface DirectAssignment {
  type: AssignmentType.DIRECT;
  assignmentTargets: ResourceType[];
}

export interface ResourceGroupAssignment {
  type: AssignmentType.RESOURCE_GROUP;
  name: string;
  assignmentTargets: ResourceType[];
}

export type ResourceAssignment = DirectAssignment | ResourceGroupAssignment;

export interface StudentGroupAssignment {
  type: AssignmentType.STUDENT_GROUP;
  name: string;
  assignedTo: ResourceAssignment[];
}

export type Assignment = ResourceAssignment | StudentGroupAssignment;

export interface StudentWithAssignments extends StudentType {
  assignedTo: Assignment[];
}

// Reverse assignments: from resources to students

export interface DirectStudentAssignment {
  type: AssignmentType.DIRECT;
  assignmentTargets: StudentType[];
}

export interface StudentGroupStudentAssignment {
  type: AssignmentType.STUDENT_GROUP;
  name: string;
  assignmentTargets: StudentType[];
}

export type StudentAssignment = DirectStudentAssignment | StudentGroupStudentAssignment;

export interface ResourceGroupStudentAssignment {
  type: AssignmentType.RESOURCE_GROUP;
  name: string;
  assignedTo: StudentAssignment[];
}

export type ReverseAssignment = StudentAssignment | ResourceGroupStudentAssignment;

export interface ResourceWithAssignments extends ResourceType {
  assignedTo: ReverseAssignment[];
}
