import { ResourceType } from "@/types/resource";

import {
  AssignmentRecord,
  CreateAssignmentRequest,
  ResourceAssignmentsResponse,
  ResourceGroupAssignmentsResponse,
  StudentAssignmentsResponse,
  StudentGroupAssignmentsResponse,
} from "../assignmentApi";
import { StudentType } from "../studentApi";
import { mockDatabase } from "./mockDatabase";

export const assignmentApiMock = {
  // Create assignments between resources/resource groups and students/student groups
  async createAssignments(request: CreateAssignmentRequest): Promise<boolean> {
    console.log(
      "[assignmentApiMock.createAssignments]",
      JSON.stringify(request, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    const resourceIds = request.resourceIds || [];
    const resourceGroupIds = request.resourceGroupIds || [];
    const studentIds = request.studentIds || [];
    const studentGroupIds = request.studentGroupIds || [];

    // Create assignments for each combination
    for (const resourceId of resourceIds) {
      for (const studentId of studentIds) {
        // Check if assignment already exists
        const exists = mockDatabase.assignments.some(
          (a) => a.resourceId === resourceId && a.studentId === studentId,
        );
        if (!exists) {
          mockDatabase.assignments.push({
            id: Math.random().toString(36).substring(2, 11),
            resourceId,
            studentId,
            createdAt: new Date().toISOString(),
          });
        }
      }

      for (const studentGroupId of studentGroupIds) {
        const exists = mockDatabase.assignments.some(
          (a) =>
            a.resourceId === resourceId && a.studentGroupId === studentGroupId,
        );
        if (!exists) {
          mockDatabase.assignments.push({
            id: Math.random().toString(36).substring(2, 11),
            resourceId,
            studentGroupId,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    for (const resourceGroupId of resourceGroupIds) {
      for (const studentId of studentIds) {
        const exists = mockDatabase.assignments.some(
          (a) =>
            a.resourceGroupId === resourceGroupId && a.studentId === studentId,
        );
        if (!exists) {
          mockDatabase.assignments.push({
            id: Math.random().toString(36).substring(2, 11),
            resourceGroupId,
            studentId,
            createdAt: new Date().toISOString(),
          });
        }
      }

      for (const studentGroupId of studentGroupIds) {
        const exists = mockDatabase.assignments.some(
          (a) =>
            a.resourceGroupId === resourceGroupId &&
            a.studentGroupId === studentGroupId,
        );
        if (!exists) {
          mockDatabase.assignments.push({
            id: Math.random().toString(36).substring(2, 11),
            resourceGroupId,
            studentGroupId,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    return true;
  },

  // Delete a single assignment
  async deleteAssignment(assignmentId: string): Promise<boolean> {
    console.log(
      "[assignmentApiMock.deleteAssignment]",
      JSON.stringify({ assignmentId }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    const initialLength = mockDatabase.assignments.length;
    mockDatabase.assignments = mockDatabase.assignments.filter(
      (a) => a.id !== assignmentId,
    );
    return mockDatabase.assignments.length < initialLength;
  },

  // Delete multiple assignments
  async deleteAssignments(assignmentIds: string[]): Promise<boolean> {
    console.log(
      "[assignmentApiMock.deleteAssignments]",
      JSON.stringify({ assignmentIds }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));
    const initialLength = mockDatabase.assignments.length;
    mockDatabase.assignments = mockDatabase.assignments.filter(
      (a) => !assignmentIds.includes(a.id),
    );
    return mockDatabase.assignments.length < initialLength;
  },

  // Delete assignments by combination (matching create format)
  async deleteAssignmentsBulk(
    request: CreateAssignmentRequest,
  ): Promise<boolean> {
    console.log(
      "[assignmentApiMock.deleteAssignmentsBulk]",
      JSON.stringify(request, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    const resourceIds = request.resourceIds || [];
    const resourceGroupIds = request.resourceGroupIds || [];
    const studentIds = request.studentIds || [];
    const studentGroupIds = request.studentGroupIds || [];

    const initialLength = mockDatabase.assignments.length;

    // Delete assignments matching each combination
    mockDatabase.assignments = mockDatabase.assignments.filter((a) => {
      // Check resource + student combinations
      if (
        resourceIds.includes(a.resourceId!) &&
        studentIds.includes(a.studentId!)
      ) {
        return false;
      }
      // Check resource + student group combinations
      if (
        resourceIds.includes(a.resourceId!) &&
        studentGroupIds.includes(a.studentGroupId!)
      ) {
        return false;
      }
      // Check resource group + student combinations
      if (
        resourceGroupIds.includes(a.resourceGroupId!) &&
        studentIds.includes(a.studentId!)
      ) {
        return false;
      }
      // Check resource group + student group combinations
      if (
        resourceGroupIds.includes(a.resourceGroupId!) &&
        studentGroupIds.includes(a.studentGroupId!)
      ) {
        return false;
      }
      return true;
    });

    return mockDatabase.assignments.length < initialLength;
  },

  // Get assignments for a specific resource - returns flat list of students
  async getResourceAssignments(
    resourceId: string,
  ): Promise<ResourceAssignmentsResponse> {
    console.log(
      "[assignmentApiMock.getResourceAssignments]",
      JSON.stringify({ resourceId }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Find all direct student assignments for this resource
    const directStudentAssignments = mockDatabase.assignments.filter(
      (a) => a.resourceId === resourceId && a.studentId,
    );

    // Get flat list of students
    const assignedTo: StudentType[] = directStudentAssignments
      .map((a) => mockDatabase.students.find((s) => s.id === a.studentId))
      .filter((s): s is StudentType => s !== undefined);

    const response = { resourceId, assignedTo };
    console.log(
      "[assignmentApiMock.getResourceAssignments] Response:",
      JSON.stringify(response, null, 2),
    );
    return response;
  },

  // Get assignments for a specific resource group - returns flat list of students
  async getResourceGroupAssignments(
    resourceGroupId: string,
  ): Promise<ResourceGroupAssignmentsResponse> {
    console.log(
      "[assignmentApiMock.getResourceGroupAssignments]",
      JSON.stringify({ resourceGroupId }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Find all direct student assignments for this resource group
    const directStudentAssignments = mockDatabase.assignments.filter(
      (a) => a.resourceGroupId === resourceGroupId && a.studentId,
    );

    // Get flat list of students
    const assignedTo: StudentType[] = directStudentAssignments
      .map((a) => mockDatabase.students.find((s) => s.id === a.studentId))
      .filter((s): s is StudentType => s !== undefined);

    const response = { resourceGroupId, assignedTo };
    console.log(
      "[assignmentApiMock.getResourceGroupAssignments] Response:",
      JSON.stringify(response, null, 2),
    );
    return response;
  },

  // Get assignments for a specific student - returns flat list of resources
  async getStudentAssignments(
    studentId: string,
  ): Promise<StudentAssignmentsResponse> {
    console.log(
      "[assignmentApiMock.getStudentAssignments]",
      JSON.stringify({ studentId }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Direct resource assignments
    const directResourceAssignments = mockDatabase.assignments.filter(
      (a) => a.studentId === studentId && a.resourceId,
    );

    // Get flat list of resources
    const assignedTo: ResourceType[] = directResourceAssignments
      .map((a) => mockDatabase.resources.find((r) => r.id === a.resourceId))
      .filter((r): r is ResourceType => r !== undefined);

    const response = { studentId, assignedTo };
    console.log(
      "[assignmentApiMock.getStudentAssignments] Response:",
      JSON.stringify(response, null, 2),
    );
    return response;
  },

  // Get assignments for a specific student group - returns flat list of resources
  async getStudentGroupAssignments(
    studentGroupId: string,
  ): Promise<StudentGroupAssignmentsResponse> {
    console.log(
      "[assignmentApiMock.getStudentGroupAssignments]",
      JSON.stringify({ studentGroupId }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Direct resource assignments to this student group
    const directResourceAssignments = mockDatabase.assignments.filter(
      (a) => a.studentGroupId === studentGroupId && a.resourceId,
    );

    // Get flat list of resources
    const assignedTo: ResourceType[] = directResourceAssignments
      .map((a) => mockDatabase.resources.find((r) => r.id === a.resourceId))
      .filter((r): r is ResourceType => r !== undefined);

    const response = { studentGroupId, assignedTo };
    console.log(
      "[assignmentApiMock.getStudentGroupAssignments] Response:",
      JSON.stringify(response, null, 2),
    );
    return response;
  },

  // Helper to get assignment count for a resource
  async getResourceAssignmentCount(resourceId: string): Promise<number> {
    console.log(
      "[assignmentApiMock.getResourceAssignmentCount]",
      JSON.stringify({ resourceId }, null, 2),
    );
    const assignments = mockDatabase.assignments.filter(
      (a) => a.resourceId === resourceId,
    );
    const count = assignments.length;
    console.log(
      "[assignmentApiMock.getResourceAssignmentCount] Response:",
      count,
    );
    return count;
  },

  // Helper to get assignment count for a resource group
  async getResourceGroupAssignmentCount(
    resourceGroupId: string,
  ): Promise<number> {
    console.log(
      "[assignmentApiMock.getResourceGroupAssignmentCount]",
      JSON.stringify({ resourceGroupId }, null, 2),
    );
    const assignments = mockDatabase.assignments.filter(
      (a) => a.resourceGroupId === resourceGroupId,
    );
    const count = assignments.length;
    console.log(
      "[assignmentApiMock.getResourceGroupAssignmentCount] Response:",
      count,
    );
    return count;
  },

  // Get all assignments (for internal use)
  getAssignments(): AssignmentRecord[] {
    return [...mockDatabase.assignments];
  },

  // Get assignment by ID (for deletion tracking)
  async getAssignmentById(id: string): Promise<AssignmentRecord | null> {
    console.log(
      "[assignmentApiMock.getAssignmentById]",
      JSON.stringify({ id }, null, 2),
    );
    const assignment =
      mockDatabase.assignments.find((a) => a.id === id) || null;
    console.log(
      "[assignmentApiMock.getAssignmentById] Response:",
      JSON.stringify(assignment, null, 2),
    );
    return assignment;
  },
};
