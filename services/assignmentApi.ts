import { ResourceType, ResourceGroupType } from "@/types/resource";
import { StudentGroupType } from "@/types/studentGroup";

import { apiRequest } from "./api";
import { assignmentApiMock } from "./mock/assignmentApi";
import { StudentType } from "./studentApi";

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === "true";

// Assignment source types
export type AssignmentSource =
  | { type: "resource"; resource: ResourceType }
  | { type: "resourceGroup"; resourceGroup: ResourceGroupType };

// Assignment target types
export type AssignmentTarget =
  | { type: "student"; student: StudentType }
  | { type: "studentGroup"; studentGroup: StudentGroupType };

// Stored assignment record
export interface AssignmentRecord {
  id: string;
  // Source: what is being assigned
  resourceId?: string;
  resourceGroupId?: string;
  // Target: who receives the assignment
  studentId?: string;
  studentGroupId?: string;
  // Metadata
  createdAt: string;
}

// Assignment with full details for display
export interface AssignmentDetails {
  id: string;
  source: AssignmentSource;
  target: AssignmentTarget;
  createdAt: string;
}

// Response types for viewing assignments - simplified flat lists for MVP
export interface ResourceAssignmentsResponse {
  resourceId: string;
  assignedTo: StudentType[];
}

export interface ResourceGroupAssignmentsResponse {
  resourceGroupId: string;
  assignedTo: StudentType[];
}

export interface StudentAssignmentsResponse {
  studentId: string;
  assignedTo: ResourceType[];
}

export interface StudentGroupAssignmentsResponse {
  studentGroupId: string;
  assignedTo: ResourceType[];
}

// Create assignment request
export interface CreateAssignmentRequest {
  resourceIds?: string[];
  resourceGroupIds?: string[];
  studentIds?: string[];
  studentGroupIds?: string[];
}

// Delete assignment request (same format as create for bulk operations)
export interface DeleteAssignmentRequest {
  resourceIds?: string[];
  resourceGroupIds?: string[];
  studentIds?: string[];
  studentGroupIds?: string[];
}

const realApi = {
  // Create assignments between resources/resource groups and students/student groups
  async createAssignments(request: CreateAssignmentRequest): Promise<boolean> {
    await apiRequest("/assignment", {
      method: "POST",
      body: JSON.stringify(request),
    });
    return true;
  },

  // Delete a single assignment
  async deleteAssignment(assignmentId: string): Promise<boolean> {
    await apiRequest(`/assignment/${assignmentId}`, {
      method: "DELETE",
    });
    return true;
  },

  // Delete multiple assignments
  async deleteAssignments(assignmentIds: string[]): Promise<boolean> {
    await apiRequest("/assignment/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids: assignmentIds }),
    });
    return true;
  },

  // Delete assignments by combination (matching create format)
  async deleteAssignmentsBulk(
    request: DeleteAssignmentRequest,
  ): Promise<boolean> {
    await apiRequest("/assignment/bulk-delete-by-combination", {
      method: "POST",
      body: JSON.stringify(request),
    });
    return true;
  },

  // Get assignments for a specific resource
  async getResourceAssignments(
    resourceId: string,
  ): Promise<ResourceAssignmentsResponse> {
    const response = await apiRequest<ResourceAssignmentsResponse>(
      `/assignment/resource/${resourceId}`,
    );
    return response;
  },

  // Get assignments for a specific resource group
  async getResourceGroupAssignments(
    resourceGroupId: string,
  ): Promise<ResourceGroupAssignmentsResponse> {
    const response = await apiRequest<ResourceGroupAssignmentsResponse>(
      `/assignment/resource-group/${resourceGroupId}`,
    );
    return response;
  },

  // Get assignments for a specific student
  async getStudentAssignments(
    studentId: string,
  ): Promise<StudentAssignmentsResponse> {
    const response = await apiRequest<StudentAssignmentsResponse>(
      `/assignment/student/${studentId}`,
    );
    return response;
  },

  // Get assignments for a specific student group
  async getStudentGroupAssignments(
    studentGroupId: string,
  ): Promise<StudentGroupAssignmentsResponse> {
    const response = await apiRequest<StudentGroupAssignmentsResponse>(
      `/assignment/student-group/${studentGroupId}`,
    );
    return response;
  },
};

export const assignmentApi = USE_MOCK_API ? assignmentApiMock : realApi;
