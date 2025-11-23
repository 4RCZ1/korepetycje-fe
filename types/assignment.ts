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
