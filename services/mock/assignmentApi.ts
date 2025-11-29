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
    await new Promise((resolve) => setTimeout(resolve, 300));
    const initialLength = mockDatabase.assignments.length;
    mockDatabase.assignments = mockDatabase.assignments.filter(
      (a) => a.id !== assignmentId,
    );
    return mockDatabase.assignments.length < initialLength;
  },

  // Delete multiple assignments
  async deleteAssignments(assignmentIds: string[]): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const initialLength = mockDatabase.assignments.length;
    mockDatabase.assignments = mockDatabase.assignments.filter(
      (a) => !assignmentIds.includes(a.id),
    );
    return mockDatabase.assignments.length < initialLength;
  },

  // Get assignments for a specific resource
  async getResourceAssignments(
    resourceId: string,
  ): Promise<ResourceAssignmentsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Find all assignments for this resource
    const directStudentAssignments = mockDatabase.assignments.filter(
      (a) => a.resourceId === resourceId && a.studentId,
    );

    const studentGroupAssignments = mockDatabase.assignments.filter(
      (a) => a.resourceId === resourceId && a.studentGroupId,
    );

    // Resolve student details
    const directStudents = directStudentAssignments
      .map((a) => mockDatabase.students.find((s) => s.id === a.studentId))
      .filter((s) => s !== undefined);

    // Resolve student group details
    const studentGroups = studentGroupAssignments
      .map((a) => {
        const group = mockDatabase.studentGroups.find(
          (g) => g.id === a.studentGroupId,
        );
        if (!group) return null;
        return {
          group,
          students: group.students,
        };
      })
      .filter((g) => g !== null);

    return {
      resourceId,
      assignments: {
        directStudents,
        studentGroups,
      },
    };
  },

  // Get assignments for a specific resource group
  async getResourceGroupAssignments(
    resourceGroupId: string,
  ): Promise<ResourceGroupAssignmentsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Find all assignments for this resource group
    const directStudentAssignments = mockDatabase.assignments.filter(
      (a) => a.resourceGroupId === resourceGroupId && a.studentId,
    );

    const studentGroupAssignments = mockDatabase.assignments.filter(
      (a) => a.resourceGroupId === resourceGroupId && a.studentGroupId,
    );

    // Resolve student details
    const directStudents = directStudentAssignments
      .map((a) => mockDatabase.students.find((s) => s.id === a.studentId))
      .filter((s) => s !== undefined);

    // Resolve student group details
    const studentGroups = studentGroupAssignments
      .map((a) => {
        const group = mockDatabase.studentGroups.find(
          (g) => g.id === a.studentGroupId,
        );
        if (!group) return null;
        return {
          group,
          students: group.students,
        };
      })
      .filter((g) => g !== null);

    return {
      resourceGroupId,
      assignments: {
        directStudents,
        studentGroups,
      },
    };
  },

  // Get assignments for a specific student
  async getStudentAssignments(
    studentId: string,
  ): Promise<StudentAssignmentsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Direct resource assignments
    const directResourceAssignments = mockDatabase.assignments.filter(
      (a) => a.studentId === studentId && a.resourceId,
    );

    // Direct resource group assignments
    const directResourceGroupAssignments = mockDatabase.assignments.filter(
      (a) => a.studentId === studentId && a.resourceGroupId,
    );

    // Find student groups this student belongs to
    const studentGroupsForStudent = mockDatabase.studentGroups.filter((g) =>
      g.students.some((s) => s.id === studentId),
    );

    // Get resources inherited from student groups
    const inheritedFromGroups = studentGroupsForStudent.map((group) => {
      // Get direct resources assigned to this student group
      const groupResourceAssignments = mockDatabase.assignments.filter(
        (a) => a.studentGroupId === group.id && a.resourceId,
      );

      // Get resource groups assigned to this student group
      const groupResourceGroupAssignments = mockDatabase.assignments.filter(
        (a) => a.studentGroupId === group.id && a.resourceGroupId,
      );

      return {
        group,
        resources: groupResourceAssignments
          .map((a) => mockDatabase.resources.find((r) => r.id === a.resourceId))
          .filter((r) => r !== undefined),
        resourceGroups: groupResourceGroupAssignments
          .map((a) =>
            mockDatabase.resourceGroups.find(
              (rg) => rg.id === a.resourceGroupId,
            ),
          )
          .filter((rg) => rg !== undefined),
      };
    });

    return {
      studentId,
      assignments: {
        directResources: directResourceAssignments
          .map((a) => mockDatabase.resources.find((r) => r.id === a.resourceId))
          .filter((r) => r !== undefined),
        resourceGroups: directResourceGroupAssignments
          .map((a) =>
            mockDatabase.resourceGroups.find(
              (rg) => rg.id === a.resourceGroupId,
            ),
          )
          .filter((rg) => rg !== undefined),
        inheritedFromGroups: inheritedFromGroups.filter(
          (g) => g.resources.length > 0 || g.resourceGroups.length > 0,
        ),
      },
    };
  },

  // Get assignments for a specific student group
  async getStudentGroupAssignments(
    studentGroupId: string,
  ): Promise<StudentGroupAssignmentsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Direct resource assignments to this student group
    const directResourceAssignments = mockDatabase.assignments.filter(
      (a) => a.studentGroupId === studentGroupId && a.resourceId,
    );

    // Direct resource group assignments to this student group
    const directResourceGroupAssignments = mockDatabase.assignments.filter(
      (a) => a.studentGroupId === studentGroupId && a.resourceGroupId,
    );

    return {
      studentGroupId,
      assignments: {
        directResources: directResourceAssignments
          .map((a) => mockDatabase.resources.find((r) => r.id === a.resourceId))
          .filter((r) => r !== undefined),
        resourceGroups: directResourceGroupAssignments
          .map((a) =>
            mockDatabase.resourceGroups.find(
              (rg) => rg.id === a.resourceGroupId,
            ),
          )
          .filter((rg) => rg !== undefined),
      },
    };
  },

  // Helper to get assignment count for a resource
  async getResourceAssignmentCount(resourceId: string): Promise<number> {
    const assignments = mockDatabase.assignments.filter(
      (a) => a.resourceId === resourceId,
    );
    return assignments.length;
  },

  // Helper to get assignment count for a resource group
  async getResourceGroupAssignmentCount(
    resourceGroupId: string,
  ): Promise<number> {
    const assignments = mockDatabase.assignments.filter(
      (a) => a.resourceGroupId === resourceGroupId,
    );
    return assignments.length;
  },

  // Get all assignments (for internal use)
  getAssignments(): AssignmentRecord[] {
    return [...mockDatabase.assignments];
  },

  // Get assignment by ID (for deletion tracking)
  async getAssignmentById(id: string): Promise<AssignmentRecord | null> {
    return mockDatabase.assignments.find((a) => a.id === id) || null;
  },
};
