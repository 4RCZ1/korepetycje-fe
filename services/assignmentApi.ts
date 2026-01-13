import { ResourceType, ResourceGroupType } from "@/types/resource";
import { StudentGroupType } from "@/types/studentGroup";

import { apiRequest } from "./api";
import { assignmentApiMock } from "./mock/assignmentApi";
import { StudentType } from "./studentApi";

const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API === "true";

/**
 * Assignment API - Backend Endpoint Status
 * 
 * ✅ SUPPORTED:
 * - POST /assignment - Create assignments (bulk)
 * - DELETE /assignment - Delete assignments (bulk)
 * - GET /assignment/resource/{resourceGuid} - Get students assigned to a resource
 * - GET /resources/student/{studentId} - Get complete resource structure for student
 * 
 * ✅ WORKAROUNDS IMPLEMENTED:
 * - GET resource group assignments: Query any resource in the group via /api/students/resource/{guid}
 * - GET student group assignments: Query any member via /api/resources/student/{id}
 * Note: These return direct assignments only (not full tree), as frontend only creates direct assignments
 * 
 * ❌ MISSING (not implemented by backend):
 * - DELETE by assignment ID (old API pattern, use bulk delete instead)
 * 
 * Note: The student resources endpoint provides a comprehensive hierarchical view
 * including direct resources, resource groups, and student group memberships.
 */

// --- DTOs matching Backend ---
interface ApiAddressDto {
  ExternalId: string;
  AddressName: string;
  AddressData: string;
}

interface ApiStudentDto {
  ExternalId: string;
  Name: string;
  Surname: string;
  PhoneNumber?: string;
  Email?: string;
  IsDeleted?: boolean;
  Address?: ApiAddressDto;
}

interface ApiResourceAssignmentsDto {
  resourdeGuid: string;
  students: ApiStudentDto[];
}

interface MultiAssignmentDto {
  ResourceIds: string[];
  ResourceGroupIds: string[];
  StudentIds: string[];
  StudentGroupIds: string[];
}

// DTOs for GET /api/resources/student/{studentId}
interface ApiResourceDto {
  Id: string;
  Name: string;
}

interface ApiResourceGroupWithResourcesDto {
  Id: string;
  Name: string;
  IsSingle: boolean;
  Resources: ApiResourceDto[];
}

interface ApiStudentGroupWithAccessDto {
  Id: string;
  Name: string;
  IsSingle: boolean;
  DirectResources: ApiResourceDto[];
  ResourceGroups: ApiResourceGroupWithResourcesDto[];
}

interface ApiStudentResourcesDto {
  StudentId: number;
  Name: string;
  Surname: string;
  DirectResources: ApiResourceDto[];
  ResourceGroups: ApiResourceGroupWithResourcesDto[];
  StudentGroups: ApiStudentGroupWithAccessDto[];
}

// DTOs for GET /api/students/resource/{resourceGuid}
interface ApiStudentGroupWithMembersDto {
  Id: string;
  Name: string;
  IsSingle: boolean;
  Students: ApiStudentDto[];
}

interface ApiResourceGroupWithAssignmentsDto {
  Id: string;
  Name: string;
  IsSingle: boolean;
  DirectStudents: ApiStudentDto[];
  StudentGroups: ApiStudentGroupWithMembersDto[];
}

interface ApiResourceAssignmentsDetailedDto {
  Id: string;
  Name: string;
  DirectStudents: ApiStudentDto[];
  StudentGroups: ApiStudentGroupWithMembersDto[];
  ResourceGroups: ApiResourceGroupWithAssignmentsDto[];
}
// -----------------------------

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
  resourceGroupName: string;
  // Students assigned directly to this resource group
  directStudents: StudentType[];
  // Student groups assigned to this resource group
  studentGroups: Array<{
    id: string;
    name: string;
    students: StudentType[];
  }>;
}

// Hierarchical response for student's complete resource access
export interface StudentResourceGroup {
  id: string;
  name: string;
  resources: ResourceType[];
}

export interface StudentGroupAccess {
  id: string;
  name: string;
  directResources: ResourceType[];
  resourceGroups: StudentResourceGroup[];
}

export interface StudentAssignmentsResponse {
  studentId: string;
  studentName: string;
  studentSurname: string;
  // Resources assigned directly to the student
  directResources: ResourceType[];
  // Resource groups assigned directly to the student
  resourceGroups: StudentResourceGroup[];
  // Student groups and their resource access
  studentGroups: StudentGroupAccess[];
}

export interface StudentGroupAssignmentsResponse {
  studentGroupId: string;
  studentGroupName: string;
  // Resources assigned directly to this student group
  directResources: ResourceType[];
  // Resource groups assigned to this student group
  resourceGroups: Array<{
    id: string;
    name: string;
    resources: ResourceType[];
  }>;
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
    const body: MultiAssignmentDto = {
      ResourceIds: request.resourceIds || [],
      ResourceGroupIds: request.resourceGroupIds || [],
      StudentIds: request.studentIds || [],
      StudentGroupIds: request.studentGroupIds || [],
    };
    await apiRequest("/assignment", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return true;
  },

  // Delete a single assignment -> Not supported by new API directly via ID
  async deleteAssignment(assignmentId: string): Promise<boolean> {
    console.warn("deleteAssignment(id) is deprecated. Use deleteAssignmentsBulk.");
    return false;
  },

  // Delete multiple assignments -> Not supported by new API directly via ID
  async deleteAssignments(assignmentIds: string[]): Promise<boolean> {
     console.warn("deleteAssignments(ids) is deprecated. Use deleteAssignmentsBulk.");
     return false;
  },

  // Delete assignments by combination (matching create format)
  async deleteAssignmentsBulk(
    request: DeleteAssignmentRequest,
  ): Promise<boolean> {
    const body: MultiAssignmentDto = {
      ResourceIds: request.resourceIds || [],
      ResourceGroupIds: request.resourceGroupIds || [],
      StudentIds: request.studentIds || [],
      StudentGroupIds: request.studentGroupIds || [],
    };
    await apiRequest("/assignment", {
      method: "DELETE",
      body: JSON.stringify(body),
    });
    return true;
  },

  // Get assignments for a specific resource
  // Endpoint: GET /api/assignment/resource/{resourceGuid}
  async getResourceAssignments(
    resourceId: string,
  ): Promise<ResourceAssignmentsResponse> {
    const response = await apiRequest<ApiResourceAssignmentsDto>(
      `/assignment/resource/${resourceId}`,
    );

    const students: StudentType[] = (response.students || []).map((dto) => ({
      id: dto.ExternalId,
      name: dto.Name,
      surname: dto.Surname,
      address: dto.Address
        ? {
            id: dto.Address.ExternalId,
            name: dto.Address.AddressName,
            data: dto.Address.AddressData,
          }
        : { id: "unknown", name: "Unknown", data: "" },
    }));

    return {
      resourceId: response.resourdeGuid, // Using the typo property from API
      assignedTo: students,
    };
  },

  // Get assignments for a specific resource group
  // Workaround: Query any resource in the group and extract the resource group's assignments
  async getResourceGroupAssignments(
    resourceGroupId: string,
  ): Promise<ResourceGroupAssignmentsResponse> {
    // Step 1: Get all resource groups to find this one and get a sample resource
    const groupsResponse = await apiRequest<Array<{ Id: string; Name: string; Resources: ApiResourceDto[] }>>(
      "/resource-group",
    );

    const targetGroup = groupsResponse.find((g) => g.Id === resourceGroupId);
    if (!targetGroup) {
      throw new Error("Resource group not found");
    }

    // If the group has no resources, return empty assignments
    if (!targetGroup.Resources || targetGroup.Resources.length === 0) {
      return {
        resourceGroupId,
        resourceGroupName: targetGroup.Name,
        directStudents: [],
        studentGroups: [],
      };
    }

    // Step 2: Query assignments for any resource in the group
    const sampleResourceId = targetGroup.Resources[0].Id;
    const assignmentsResponse = await apiRequest<ApiResourceAssignmentsDetailedDto>(
      `/students/resource/${sampleResourceId}`,
    );

    // Step 3: Find this resource group in the response
    const rgAssignments = assignmentsResponse.ResourceGroups?.find(
      (rg) => rg.Id === resourceGroupId,
    );

    if (!rgAssignments) {
      return {
        resourceGroupId,
        resourceGroupName: targetGroup.Name,
        directStudents: [],
        studentGroups: [],
      };
    }

    // Convert to frontend types
    const directStudents: StudentType[] = (rgAssignments.DirectStudents || []).map(
      (dto) => ({
        id: dto.ExternalId,
        name: dto.Name,
        surname: dto.Surname,
        address: dto.Address
          ? {
              id: dto.Address.ExternalId,
              name: dto.Address.AddressName,
              data: dto.Address.AddressData,
            }
          : { id: "unknown", name: "Unknown", data: "" },
      }),
    );

    const studentGroups = (rgAssignments.StudentGroups || []).map((sg) => ({
      id: sg.Id,
      name: sg.Name,
      students: sg.Students.map((dto) => ({
        id: dto.ExternalId,
        name: dto.Name,
        surname: dto.Surname,
        address: dto.Address
          ? {
              id: dto.Address.ExternalId,
              name: dto.Address.AddressName,
              data: dto.Address.AddressData,
            }
          : { id: "unknown", name: "Unknown", data: "" },
      })),
    }));

    return {
      resourceGroupId,
      resourceGroupName: targetGroup.Name,
      directStudents,
      studentGroups,
    };
  },

  // Get complete resource structure for a specific student
  // Endpoint: GET /api/resources/student/{studentId}
  async getStudentAssignments(
    studentId: string,
  ): Promise<StudentAssignmentsResponse> {
    const response = await apiRequest<ApiStudentResourcesDto>(
      `/resources/student/${studentId}`,
    );

    // Convert DTOs to frontend types
    const convertResource = (dto: ApiResourceDto): ResourceType => ({
      id: dto.Id,
      name: dto.Name,
      uploadDate: new Date().toISOString(), // Not provided by this endpoint
      fileSize: 0, // Not provided by this endpoint
      fileType: dto.Name.split(".").pop() || "unknown",
    });

    const convertResourceGroup = (
      dto: ApiResourceGroupWithResourcesDto,
    ): StudentResourceGroup => ({
      id: dto.Id,
      name: dto.Name,
      resources: dto.Resources.map(convertResource),
    });

    const convertStudentGroup = (
      dto: ApiStudentGroupWithAccessDto,
    ): StudentGroupAccess => ({
      id: dto.Id,
      name: dto.Name,
      directResources: dto.DirectResources.map(convertResource),
      resourceGroups: dto.ResourceGroups.map(convertResourceGroup),
    });

    return {
      studentId: response.StudentId.toString(),
      studentName: response.Name,
      studentSurname: response.Surname,
      directResources: response.DirectResources.map(convertResource),
      resourceGroups: response.ResourceGroups.map(convertResourceGroup),
      studentGroups: response.StudentGroups.map(convertStudentGroup),
    };
  },

  // Get assignments for a specific student group
  // Workaround: Query any member of the group and extract the student group's assignments
  async getStudentGroupAssignments(
    studentGroupId: string,
  ): Promise<StudentGroupAssignmentsResponse> {
    // Step 1: Get all student groups to find this one and get a sample student
    const groupsResponse = await apiRequest<Array<{ Id: string; Name: string; Students: ApiStudentDto[] }>>(
      "/student-group",
    );

    const targetGroup = groupsResponse.find((g) => g.Id === studentGroupId);
    if (!targetGroup) {
      throw new Error("Student group not found");
    }

    // If the group has no students, return empty assignments
    if (!targetGroup.Students || targetGroup.Students.length === 0) {
      return {
        studentGroupId,
        studentGroupName: targetGroup.Name,
        directResources: [],
        resourceGroups: [],
      };
    }

    // Step 2: Query resources for any student in the group
    const sampleStudentId = targetGroup.Students[0].ExternalId;
    const resourcesResponse = await apiRequest<ApiStudentResourcesDto>(
      `/resources/student/${sampleStudentId}`,
    );

    // Step 3: Find this student group in the response
    const sgAssignments = resourcesResponse.StudentGroups?.find(
      (sg) => sg.Id === studentGroupId,
    );

    if (!sgAssignments) {
      return {
        studentGroupId,
        studentGroupName: targetGroup.Name,
        directResources: [],
        resourceGroups: [],
      };
    }

    // Convert to frontend types
    const convertResource = (dto: ApiResourceDto): ResourceType => ({
      id: dto.Id,
      name: dto.Name,
      uploadDate: new Date().toISOString(),
      fileSize: 0,
      fileType: dto.Name.split(".").pop() || "unknown",
    });

    const directResources = sgAssignments.DirectResources.map(convertResource);

    const resourceGroups = sgAssignments.ResourceGroups.map((rg) => ({
      id: rg.Id,
      name: rg.Name,
      resources: rg.Resources.map(convertResource),
    }));

    return {
      studentGroupId,
      studentGroupName: targetGroup.Name,
      directResources,
      resourceGroups,
    };
  },
};

export const assignmentApi = USE_MOCK_API ? assignmentApiMock : realApi;
