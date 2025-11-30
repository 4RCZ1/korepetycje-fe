import {
  AssignmentType,
  ReverseAssignment,
  ResourceAssignment,
  Assignment,
} from "@/types/assignment";

import {
  AssignmentRecord,
  CreateAssignmentRequest,
  ResourceAssignmentsResponse,
  ResourceGroupAssignmentsResponse,
  StudentAssignmentsResponse,
  StudentGroupAssignmentsResponse,
} from "../assignmentApi";
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

  // Get assignments for a specific resource
  async getResourceAssignments(
    resourceId: string,
  ): Promise<ResourceAssignmentsResponse> {
    console.log(
      "[assignmentApiMock.getResourceAssignments]",
      JSON.stringify({ resourceId }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    const assignedTo: ReverseAssignment[] = [];

    // Find all assignments for this resource
    const directStudentAssignments = mockDatabase.assignments.filter(
      (a) => a.resourceId === resourceId && a.studentId,
    );

    const studentGroupAssignments = mockDatabase.assignments.filter(
      (a) => a.resourceId === resourceId && a.studentGroupId,
    );

    // Direct students
    const directStudents = directStudentAssignments
      .map((a) => mockDatabase.students.find((s) => s.id === a.studentId))
      .filter((s) => s !== undefined);

    if (directStudents.length > 0) {
      assignedTo.push({
        type: AssignmentType.DIRECT,
        assignmentTargets: directStudents,
      });
    }

    // Student groups
    studentGroupAssignments.forEach((a) => {
      const group = mockDatabase.studentGroups.find(
        (g) => g.id === a.studentGroupId,
      );
      if (group) {
        assignedTo.push({
          type: AssignmentType.STUDENT_GROUP,
          name: group.name,
          assignmentTargets: group.students,
        });
      }
    });

    const response = { resourceId, assignedTo };
    console.log(
      "[assignmentApiMock.getResourceAssignments] Response:",
      JSON.stringify(response, null, 2),
    );
    return response;
  },

  // Get assignments for a specific resource group
  async getResourceGroupAssignments(
    resourceGroupId: string,
  ): Promise<ResourceGroupAssignmentsResponse> {
    console.log(
      "[assignmentApiMock.getResourceGroupAssignments]",
      JSON.stringify({ resourceGroupId }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    const assignedTo: ReverseAssignment[] = [];

    // Find all assignments for this resource group
    const directStudentAssignments = mockDatabase.assignments.filter(
      (a) => a.resourceGroupId === resourceGroupId && a.studentId,
    );

    const studentGroupAssignments = mockDatabase.assignments.filter(
      (a) => a.resourceGroupId === resourceGroupId && a.studentGroupId,
    );

    // Direct students
    const directStudents = directStudentAssignments
      .map((a) => mockDatabase.students.find((s) => s.id === a.studentId))
      .filter((s) => s !== undefined);

    if (directStudents.length > 0) {
      assignedTo.push({
        type: AssignmentType.DIRECT,
        assignmentTargets: directStudents,
      });
    }

    // Student groups
    studentGroupAssignments.forEach((a) => {
      const group = mockDatabase.studentGroups.find(
        (g) => g.id === a.studentGroupId,
      );
      if (group) {
        assignedTo.push({
          type: AssignmentType.STUDENT_GROUP,
          name: group.name,
          assignmentTargets: group.students,
        });
      }
    });

    const response = { resourceGroupId, assignedTo };
    console.log(
      "[assignmentApiMock.getResourceGroupAssignments] Response:",
      JSON.stringify(response, null, 2),
    );
    return response;
  },

  // Get assignments for a specific student
  async getStudentAssignments(
    studentId: string,
  ): Promise<StudentAssignmentsResponse> {
    console.log(
      "[assignmentApiMock.getStudentAssignments]",
      JSON.stringify({ studentId }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    const assignedTo: Assignment[] = [];

    // Direct resource assignments
    const directResourceAssignments = mockDatabase.assignments.filter(
      (a) => a.studentId === studentId && a.resourceId,
    );
    const directResources = directResourceAssignments
      .map((a) => mockDatabase.resources.find((r) => r.id === a.resourceId))
      .filter((r) => r !== undefined);

    if (directResources.length > 0) {
      assignedTo.push({
        type: AssignmentType.DIRECT,
        assignmentTargets: directResources,
      });
    }

    // Direct resource group assignments
    const directResourceGroupAssignments = mockDatabase.assignments.filter(
      (a) => a.studentId === studentId && a.resourceGroupId,
    );
    directResourceGroupAssignments.forEach((a) => {
      const group = mockDatabase.resourceGroups.find(
        (rg) => rg.id === a.resourceGroupId,
      );
      if (group) {
        assignedTo.push({
          type: AssignmentType.RESOURCE_GROUP,
          name: group.name,
          assignmentTargets: group.resources,
        });
      }
    });

    // Find student groups this student belongs to
    const studentGroupsForStudent = mockDatabase.studentGroups.filter((g) =>
      g.students.some((s) => s.id === studentId),
    );

    // Get resources inherited from student groups
    studentGroupsForStudent.forEach((group) => {
      // Get direct resources assigned to this student group
      const groupResourceAssignments = mockDatabase.assignments.filter(
        (a) => a.studentGroupId === group.id && a.resourceId,
      );

      // Get resource groups assigned to this student group
      const groupResourceGroupAssignments = mockDatabase.assignments.filter(
        (a) => a.studentGroupId === group.id && a.resourceGroupId,
      );

      const inheritedAssignments: ResourceAssignment[] = [];

      const resources = groupResourceAssignments
        .map((a) => mockDatabase.resources.find((r) => r.id === a.resourceId))
        .filter((r) => r !== undefined);

      if (resources.length > 0) {
        inheritedAssignments.push({
          type: AssignmentType.DIRECT,
          assignmentTargets: resources,
        });
      }

      groupResourceGroupAssignments.forEach((a) => {
        const rg = mockDatabase.resourceGroups.find(
          (rg) => rg.id === a.resourceGroupId,
        );
        if (rg) {
          inheritedAssignments.push({
            type: AssignmentType.RESOURCE_GROUP,
            name: rg.name,
            assignmentTargets: rg.resources,
          });
        }
      });

      if (inheritedAssignments.length > 0) {
        assignedTo.push({
          type: AssignmentType.STUDENT_GROUP,
          name: group.name,
          assignedTo: inheritedAssignments,
        });
      }
    });

    const response = { studentId, assignedTo };
    console.log(
      "[assignmentApiMock.getStudentAssignments] Response:",
      JSON.stringify(response, null, 2),
    );
    return response;
  },

  // Get assignments for a specific student group
  async getStudentGroupAssignments(
    studentGroupId: string,
  ): Promise<StudentGroupAssignmentsResponse> {
    console.log(
      "[assignmentApiMock.getStudentGroupAssignments]",
      JSON.stringify({ studentGroupId }, null, 2),
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    const assignedTo: ResourceAssignment[] = [];

    // Direct resource assignments to this student group
    const directResourceAssignments = mockDatabase.assignments.filter(
      (a) => a.studentGroupId === studentGroupId && a.resourceId,
    );
    const directResources = directResourceAssignments
      .map((a) => mockDatabase.resources.find((r) => r.id === a.resourceId))
      .filter((r) => r !== undefined);

    if (directResources.length > 0) {
      assignedTo.push({
        type: AssignmentType.DIRECT,
        assignmentTargets: directResources,
      });
    }

    // Direct resource group assignments to this student group
    const directResourceGroupAssignments = mockDatabase.assignments.filter(
      (a) => a.studentGroupId === studentGroupId && a.resourceGroupId,
    );
    directResourceGroupAssignments.forEach((a) => {
      const group = mockDatabase.resourceGroups.find(
        (rg) => rg.id === a.resourceGroupId,
      );
      if (group) {
        assignedTo.push({
          type: AssignmentType.RESOURCE_GROUP,
          name: group.name,
          assignmentTargets: group.resources,
        });
      }
    });

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
