import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import ThemedButton from "@/components/ui/ThemedButton";
import { useAssignments } from "@/hooks/useAssignments";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  ResourceAssignmentsResponse,
  ResourceGroupAssignmentsResponse,
  StudentAssignmentsResponse,
  StudentGroupAssignmentsResponse,
} from "@/services/assignmentApi";
import { StudentType } from "@/services/studentApi";
import { ResourceGroupType, ResourceType } from "@/types/resource";
import { StudentGroupType } from "@/types/studentGroup";
import { getFileIcon } from "@/utils/fileHelpers";

type ViewMode =
  | { type: "resource"; resource: ResourceType }
  | { type: "resourceGroup"; resourceGroup: ResourceGroupType }
  | { type: "student"; student: StudentType }
  | { type: "studentGroup"; studentGroup: StudentGroupType };

type ViewAssignmentsModalProps = {
  visible: boolean;
  onClose: () => void;
  onAssignmentsChanged?: () => void;
  viewMode: ViewMode;
  onRefetch?: (refetchFn: () => Promise<void>) => void; // Expose refetch function to parent
};

export default function ViewAssignmentsModal({
  visible,
  onClose,
  onAssignmentsChanged: _onAssignmentsChanged,
  viewMode,
  onRefetch,
}: ViewAssignmentsModalProps) {
  const [loading, setLoading] = useState(false);
  const [resourceAssignments, setResourceAssignments] =
    useState<ResourceAssignmentsResponse | null>(null);
  const [resourceGroupAssignments, setResourceGroupAssignments] =
    useState<ResourceGroupAssignmentsResponse | null>(null);
  const [studentAssignments, setStudentAssignments] =
    useState<StudentAssignmentsResponse | null>(null);
  const [studentGroupAssignments, setStudentGroupAssignments] =
    useState<StudentGroupAssignmentsResponse | null>(null);

  const {
    getResourceAssignments,
    getResourceGroupAssignments,
    getStudentAssignments,
    getStudentGroupAssignments,
  } = useAssignments();

  // Colors
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");

  // Extract stable values from viewMode for dependency tracking
  const viewModeType = viewMode.type;
  const viewModeId =
    viewMode.type === "resource"
      ? viewMode.resource.id
      : viewMode.type === "resourceGroup"
        ? viewMode.resourceGroup.id
        : viewMode.type === "student"
          ? viewMode.student.id
          : viewMode.studentGroup.id;

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      if (viewMode.type === "resource") {
        const data = await getResourceAssignments(viewMode.resource.id);
        setResourceAssignments(data);
      } else if (viewMode.type === "resourceGroup") {
        const data = await getResourceGroupAssignments(
          viewMode.resourceGroup.id,
        );
        setResourceGroupAssignments(data);
      } else if (viewMode.type === "student") {
        const data = await getStudentAssignments(viewMode.student.id);
        setStudentAssignments(data);
      } else if (viewMode.type === "studentGroup") {
        const data = await getStudentGroupAssignments(viewMode.studentGroup.id);
        setStudentGroupAssignments(data);
      }
    } finally {
      setLoading(false);
    }
    // Use stable values for dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    viewModeType,
    viewModeId,
    getResourceAssignments,
    getResourceGroupAssignments,
    getStudentAssignments,
    getStudentGroupAssignments,
  ]);

  useEffect(() => {
    if (visible) {
      fetchAssignments();
    }
  }, [visible, fetchAssignments]);

  // Expose refetch function to parent
  useEffect(() => {
    if (onRefetch) {
      onRefetch(fetchAssignments);
    }
  }, [onRefetch, fetchAssignments]);

  const getTitle = () => {
    switch (viewMode.type) {
      case "resource":
        return `Przypisania: ${viewMode.resource.name}`;
      case "resourceGroup":
        return `Przypisania: ${viewMode.resourceGroup.name}`;
      case "student":
        return `Zasoby: ${viewMode.student.name} ${viewMode.student.surname}`;
      case "studentGroup":
        return `Zasoby: ${viewMode.studentGroup.name}`;
    }
  };

  const hasAssignments = () => {
    if (viewMode.type === "resource" && resourceAssignments) {
      return (
        resourceAssignments.directStudents.length > 0 ||
        resourceAssignments.studentGroups.length > 0 ||
        resourceAssignments.resourceGroups.some(
          (rg) => rg.directStudents.length > 0 || rg.studentGroups.length > 0,
        )
      );
    }
    if (viewMode.type === "resourceGroup" && resourceGroupAssignments) {
      return (
        resourceGroupAssignments.directStudents.length > 0 ||
        resourceGroupAssignments.studentGroups.length > 0
      );
    }
    if (viewMode.type === "student" && studentAssignments) {
      return (
        studentAssignments.directResources.length > 0 ||
        studentAssignments.resourceGroups.length > 0 ||
        studentAssignments.studentGroups.some(
          (sg) => sg.directResources.length > 0 || sg.resourceGroups.length > 0
        )
      );
    }
    if (viewMode.type === "studentGroup" && studentGroupAssignments) {
      return studentGroupAssignments.assignedTo.length > 0;
    }
    return false;
  };

  const renderResourceAssignments = () => {
    if (!resourceAssignments) return null;

    return (
      <>
        {/* Combined section: Przypisani Uczniowie */}
        {(resourceAssignments.directStudents.length > 0 ||
          resourceAssignments.studentGroups.length > 0) && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Przypisani Uczniowie
            </ThemedText>

            {/* Direct students */}
            {resourceAssignments.directStudents.map((student) => (
              <View
                key={`direct-${student.id}`}
                style={[styles.assignmentItem, { borderColor }]}
              >
                <MaterialIcons name="person" size={20} color={primaryColor} />
                <ThemedText
                  style={[styles.assignmentText, { color: textColor }]}
                >
                  {student.name} {student.surname}
                </ThemedText>
                <ThemedText
                  style={[styles.sourceLabel, { color: textColor + "60" }]}
                >
                  (bezpośrednio)
                </ThemedText>
              </View>
            ))}

            {/* Student groups with nested members */}
            {resourceAssignments.studentGroups.map((group) => (
              <View key={`group-${group.id}`} style={styles.groupSection}>
                {/* Student group header */}
                <View style={[styles.assignmentItem, { borderColor }]}>
                  <MaterialIcons name="group" size={20} color={primaryColor} />
                  <ThemedText
                    style={[styles.assignmentText, { color: textColor }]}
                  >
                    {group.name}
                  </ThemedText>
                  <ThemedText
                    style={[styles.sourceLabel, { color: textColor + "60" }]}
                  >
                    (grupa)
                  </ThemedText>
                </View>

                {/* Nested students from the group */}
                {group.students && group.students.length > 0 && (
                  <View style={styles.nestedContent}>
                    {group.students.map((student) => (
                      <View
                        key={`group-${group.id}-student-${student.id}`}
                        style={[styles.nestedItem, { borderColor }]}
                      >
                        <MaterialIcons
                          name="subdirectory-arrow-right"
                          size={16}
                          color={primaryColor + "80"}
                        />
                        <MaterialIcons
                          name="person"
                          size={16}
                          color={primaryColor}
                        />
                        <ThemedText
                          style={[styles.nestedText, { color: textColor }]}
                        >
                          {student.name} {student.surname}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Resource groups containing this resource */}
        {resourceAssignments.resourceGroups.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Przez Grupy Zasobów
            </ThemedText>
            {resourceAssignments.resourceGroups.map((resourceGroup) => (
              <View key={resourceGroup.id} style={styles.nestedSection}>
                {/* Resource group header */}
                <View
                  style={[
                    styles.assignmentItem,
                    { borderColor, backgroundColor: primaryColor + "08" },
                  ]}
                >
                  <MaterialIcons name="folder" size={20} color={primaryColor} />
                  <ThemedText
                    style={[styles.assignmentText, { color: textColor }]}
                  >
                    {resourceGroup.name}
                  </ThemedText>
                </View>

                {/* Direct students assigned to this resource group */}
                {resourceGroup.directStudents.length > 0 && (
                  <View style={styles.nestedContent}>
                    {resourceGroup.directStudents.map((student) => (
                      <View
                        key={`rg-${resourceGroup.id}-student-${student.id}`}
                        style={[styles.nestedItem, { borderColor }]}
                      >
                        <MaterialIcons
                          name="subdirectory-arrow-right"
                          size={16}
                          color={primaryColor + "80"}
                        />
                        <MaterialIcons
                          name="person"
                          size={16}
                          color={primaryColor}
                        />
                        <ThemedText
                          style={[styles.nestedText, { color: textColor }]}
                        >
                          {student.name} {student.surname}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.sourceLabel,
                            { color: textColor + "60" },
                          ]}
                        >
                          (bezpośrednio)
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Student groups assigned to this resource group */}
                {resourceGroup.studentGroups.length > 0 && (
                  <View style={styles.nestedContent}>
                    {resourceGroup.studentGroups.map((group) => (
                      <View
                        key={`rg-${resourceGroup.id}-group-${group.id}`}
                        style={styles.doublyNestedSection}
                      >
                        {/* Student group header */}
                        <View style={[styles.nestedItem, { borderColor }]}>
                          <MaterialIcons
                            name="subdirectory-arrow-right"
                            size={16}
                            color={primaryColor + "80"}
                          />
                          <MaterialIcons
                            name="group"
                            size={16}
                            color={primaryColor}
                          />
                          <ThemedText
                            style={[styles.nestedText, { color: textColor }]}
                          >
                            {group.name}
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.sourceLabel,
                              { color: textColor + "60" },
                            ]}
                          >
                            (grupa)
                          </ThemedText>
                        </View>

                        {/* Students from the group (double indent) */}
                        {group.students && group.students.length > 0 && (
                          <View style={styles.doublyNestedContent}>
                            {group.students.map((student) => (
                              <View
                                key={`rg-${resourceGroup.id}-group-${group.id}-student-${student.id}`}
                                style={[
                                  styles.nestedItem,
                                  { borderColor, marginLeft: 8 },
                                ]}
                              >
                                <MaterialIcons
                                  name="subdirectory-arrow-right"
                                  size={14}
                                  color={primaryColor + "60"}
                                />
                                <MaterialIcons
                                  name="person"
                                  size={14}
                                  color={primaryColor}
                                />
                                <ThemedText
                                  style={[
                                    styles.doublyNestedText,
                                    { color: textColor },
                                  ]}
                                >
                                  {student.name} {student.surname}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  const renderResourceGroupAssignments = () => {
    if (!resourceGroupAssignments) return null;

    return (
      <>
        {/* Combined section: Przypisani Uczniowie */}
        {(resourceGroupAssignments.directStudents.length > 0 ||
          resourceGroupAssignments.studentGroups.length > 0) && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Przypisani Uczniowie
            </ThemedText>

            {/* Direct students */}
            {resourceGroupAssignments.directStudents.map((student) => (
              <View
                key={`direct-${student.id}`}
                style={[styles.assignmentItem, { borderColor }]}
              >
                <MaterialIcons name="person" size={20} color={primaryColor} />
                <ThemedText
                  style={[styles.assignmentText, { color: textColor }]}
                >
                  {student.name} {student.surname}
                </ThemedText>
                <ThemedText
                  style={[styles.sourceLabel, { color: textColor + "60" }]}
                >
                  (bezpośrednio)
                </ThemedText>
              </View>
            ))}

            {/* Student groups with nested members */}
            {resourceGroupAssignments.studentGroups.map((group) => (
              <View key={`group-${group.id}`} style={styles.groupSection}>
                {/* Student group header */}
                <View style={[styles.assignmentItem, { borderColor }]}>
                  <MaterialIcons name="group" size={20} color={primaryColor} />
                  <ThemedText
                    style={[styles.assignmentText, { color: textColor }]}
                  >
                    {group.name}
                  </ThemedText>
                  <ThemedText
                    style={[styles.sourceLabel, { color: textColor + "60" }]}
                  >
                    (grupa)
                  </ThemedText>
                </View>

                {/* Nested students from the group */}
                {group.students && group.students.length > 0 && (
                  <View style={styles.nestedContent}>
                    {group.students.map((student) => (
                      <View
                        key={`group-${group.id}-student-${student.id}`}
                        style={[styles.nestedItem, { borderColor }]}
                      >
                        <MaterialIcons
                          name="subdirectory-arrow-right"
                          size={16}
                          color={primaryColor + "80"}
                        />
                        <MaterialIcons
                          name="person"
                          size={16}
                          color={primaryColor}
                        />
                        <ThemedText
                          style={[styles.nestedText, { color: textColor }]}
                        >
                          {student.name} {student.surname}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  const renderStudentAssignments = () => {
    if (!studentAssignments) return null;

    return (
      <>
        {/* Combined section: Przypisane Zasoby */}
        {(studentAssignments.directResources.length > 0 ||
          studentAssignments.resourceGroups.length > 0) && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Przypisane Zasoby
            </ThemedText>

            {/* Direct resources */}
            {studentAssignments.directResources.map((resource) => (
              <View
                key={`direct-${resource.id}`}
                style={[styles.assignmentItem, { borderColor }]}
              >
                <MaterialIcons
                  name={getFileIcon(resource.fileType, resource.name)}
                  size={20}
                  color={primaryColor}
                />
                <ThemedText
                  style={[styles.assignmentText, { color: textColor }]}
                  numberOfLines={1}
                >
                  {resource.name}
                </ThemedText>
                <ThemedText
                  style={[styles.sourceLabel, { color: textColor + "60" }]}
                >
                  (bezpośrednio)
                </ThemedText>
              </View>
            ))}

            {/* Resource groups with nested resources */}
            {studentAssignments.resourceGroups.map((group) => (
              <View key={`group-${group.id}`} style={styles.groupSection}>
                {/* Resource group header */}
                <View style={[styles.assignmentItem, { borderColor }]}>                  <MaterialIcons name="folder" size={20} color={primaryColor} />
                  <ThemedText
                    style={[styles.assignmentText, { color: textColor }]}
                  >
                    {group.name}
                  </ThemedText>
                  <ThemedText
                    style={[styles.sourceLabel, { color: textColor + "60" }]}
                  >
                    (grupa)
                  </ThemedText>
                </View>

                {/* Nested resources from the group */}
                {group.resources && group.resources.length > 0 && (
                  <View style={styles.nestedContent}>
                    {group.resources.map((resource) => (
                      <View
                        key={`group-${group.id}-resource-${resource.id}`}
                        style={[styles.nestedItem, { borderColor }]}
                      >
                        <MaterialIcons
                          name="subdirectory-arrow-right"
                          size={16}
                          color={primaryColor + "80"}
                        />
                        <MaterialIcons
                          name={getFileIcon(resource.fileType, resource.name)}
                          size={16}
                          color={primaryColor}
                        />
                        <ThemedText
                          style={[styles.nestedText, { color: textColor }]}
                          numberOfLines={1}
                        >
                          {resource.name}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Student groups containing this student */}
        {studentAssignments.studentGroups.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Przez Grupy Uczniów
            </ThemedText>
            {studentAssignments.studentGroups.map((studentGroup) => (
              <View key={studentGroup.id} style={styles.nestedSection}>
                {/* Student group header */}
                <View
                  style={[
                    styles.assignmentItem,
                    { borderColor, backgroundColor: primaryColor + "08" },
                  ]}
                >
                  <MaterialIcons name="group" size={20} color={primaryColor} />
                  <ThemedText
                    style={[styles.assignmentText, { color: textColor }]}
                  >
                    {studentGroup.name}
                  </ThemedText>
                </View>

                {/* Direct resources assigned to this student group */}
                {studentGroup.directResources.length > 0 && (
                  <View style={styles.nestedContent}>
                    {studentGroup.directResources.map((resource) => (
                      <View
                        key={`sg-${studentGroup.id}-resource-${resource.id}`}
                        style={[styles.nestedItem, { borderColor }]}
                      >
                        <MaterialIcons
                          name="subdirectory-arrow-right"
                          size={16}
                          color={primaryColor + "80"}
                        />
                        <MaterialIcons
                          name={getFileIcon(resource.fileType, resource.name)}
                          size={16}
                          color={primaryColor}
                        />
                        <ThemedText
                          style={[styles.nestedText, { color: textColor }]}
                          numberOfLines={1}
                        >
                          {resource.name}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.sourceLabel,
                            { color: textColor + "60" },
                          ]}
                        >
                          (bezpośrednio)
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Resource groups assigned to this student group */}
                {studentGroup.resourceGroups.length > 0 && (
                  <View style={styles.nestedContent}>
                    {studentGroup.resourceGroups.map((group) => (
                      <View
                        key={`sg-${studentGroup.id}-group-${group.id}`}
                        style={styles.doublyNestedSection}
                      >
                        {/* Resource group header */}
                        <View style={[styles.nestedItem, { borderColor }]}>
                          <MaterialIcons
                            name="subdirectory-arrow-right"
                            size={16}
                            color={primaryColor + "80"}
                          />
                          <MaterialIcons
                            name="folder"
                            size={16}
                            color={primaryColor}
                          />
                          <ThemedText
                            style={[styles.nestedText, { color: textColor }]}
                          >
                            {group.name}
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.sourceLabel,
                              { color: textColor + "60" },
                            ]}
                          >
                            (grupa)
                          </ThemedText>
                        </View>

                        {/* Resources from the group (double indent) */}
                        {group.resources && group.resources.length > 0 && (
                          <View style={styles.doublyNestedContent}>
                            {group.resources.map((resource) => (
                              <View
                                key={`sg-${studentGroup.id}-group-${group.id}-resource-${resource.id}`}
                                style={[
                                  styles.nestedItem,
                                  { borderColor, marginLeft: 8 },
                                ]}
                              >
                                <MaterialIcons
                                  name="subdirectory-arrow-right"
                                  size={14}
                                  color={primaryColor + "60"}
                                />
                                <MaterialIcons
                                  name={getFileIcon(
                                    resource.fileType,
                                    resource.name,
                                  )}
                                  size={14}
                                  color={primaryColor}
                                />
                                <ThemedText
                                  style={[
                                    styles.doublyNestedText,
                                    { color: textColor },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {resource.name}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  const renderStudentGroupAssignments = () => {
    if (!studentGroupAssignments || !studentGroupAssignments.assignedTo)
      return null;

    return (
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          Przypisane zasoby
        </ThemedText>
        {studentGroupAssignments.assignedTo.map((resource) => (
          <View
            key={resource.id}
            style={[styles.assignmentItem, { borderColor }]}
          >
            <MaterialIcons
              name={getFileIcon(resource.fileType, resource.name)}
              size={20}
              color={primaryColor}
            />
            <ThemedText
              style={[styles.assignmentText, { color: textColor }]}
              numberOfLines={1}
            >
              {resource.name}
            </ThemedText>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <ThemedView
          style={[styles.modalView, { backgroundColor: surfaceColor }]}
        >
          <View style={styles.header}>
            <ThemedText type="subtitle" numberOfLines={1} style={styles.title}>
              {getTitle()}
            </ThemedText>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={primaryColor}
              style={styles.loader}
            />
          ) : (
            <ScrollView style={styles.content}>
              {!hasAssignments() ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons
                    name="assignment"
                    size={48}
                    color={textColor + "40"}
                  />
                  <ThemedText
                    style={[styles.emptyText, { color: textColor + "60" }]}
                  >
                    Brak przypisań
                  </ThemedText>
                </View>
              ) : (
                <>
                  {viewMode.type === "resource" && renderResourceAssignments()}
                  {viewMode.type === "resourceGroup" &&
                    renderResourceGroupAssignments()}
                  {viewMode.type === "student" && renderStudentAssignments()}
                  {viewMode.type === "studentGroup" &&
                    renderStudentGroupAssignments()}
                </>
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <ThemedButton
              title="Zamknij"
              variant="outline"
              onPress={onClose}
              style={styles.button}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalView: {
    width: "100%",
    maxHeight: "85%",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    flex: 1,
    marginRight: 16,
  },
  content: {
    maxHeight: 400,
  },
  loader: {
    marginVertical: 40,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 8,
  },
  assignmentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 6,
    gap: 10,
  },
  assignmentText: {
    flex: 1,
    fontSize: 14,
  },
  sourceLabel: {
    fontSize: 11,
    fontStyle: "italic",
    marginLeft: 4,
  },
  groupSection: {
    marginBottom: 8,
  },
  nestedSection: {
    marginBottom: 12,
  },
  nestedContent: {
    marginLeft: 16,
    marginTop: 6,
  },
  nestedLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  nestedItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 4,
    gap: 6,
  },
  nestedText: {
    flex: 1,
    fontSize: 13,
  },
  doublyNestedSection: {
    marginBottom: 6,
  },
  doublyNestedContent: {
    marginLeft: 8,
    marginTop: 4,
  },
  doublyNestedText: {
    flex: 1,
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  button: {
    minWidth: 100,
  },
});
