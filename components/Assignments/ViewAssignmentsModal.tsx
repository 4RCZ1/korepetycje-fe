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
import { AssignmentType } from "@/types/assignment";
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
  const errorColor = useThemeColor({}, "error", "500");

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
      return resourceAssignments.assignedTo.length > 0;
    }
    if (viewMode.type === "resourceGroup" && resourceGroupAssignments) {
      return resourceGroupAssignments.assignedTo.length > 0;
    }
    if (viewMode.type === "student" && studentAssignments) {
      return studentAssignments.assignedTo.length > 0;
    }
    if (viewMode.type === "studentGroup" && studentGroupAssignments) {
      return studentGroupAssignments.assignedTo.length > 0;
    }
    return false;
  };

  const renderResourceAssignments = () => {
    if (!resourceAssignments || !resourceAssignments.assignedTo) return null;

    return resourceAssignments.assignedTo.map((assignment, index) => {
      if (assignment.type === AssignmentType.DIRECT) {
        return (
          <View key={`direct-${index}`} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Uczniowie (bezpośrednio)
            </ThemedText>
            {assignment.assignmentTargets.map((student) => (
              <View
                key={student.id}
                style={[styles.assignmentItem, { borderColor }]}
              >
                <MaterialIcons name="person" size={20} color={primaryColor} />
                <ThemedText
                  style={[styles.assignmentText, { color: textColor }]}
                >
                  {student.name} {student.surname}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.sourceTag,
                    {
                      backgroundColor: primaryColor + "20",
                      color: primaryColor,
                    },
                  ]}
                >
                  Bezpośrednio
                </ThemedText>
              </View>
            ))}
          </View>
        );
      } else if (assignment.type === AssignmentType.STUDENT_GROUP) {
        return (
          <View key={`group-${index}`} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Grupa: {assignment.name}
            </ThemedText>
            {assignment.assignmentTargets.map((student) => (
              <View
                key={student.id}
                style={[styles.assignmentItem, { borderColor }]}
              >
                <MaterialIcons name="person" size={20} color={errorColor} />
                <ThemedText
                  style={[styles.assignmentText, { color: textColor }]}
                >
                  {student.name} {student.surname}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.sourceTag,
                    { backgroundColor: errorColor + "20", color: errorColor },
                  ]}
                >
                  {assignment.name}
                </ThemedText>
              </View>
            ))}
          </View>
        );
      }
      return null;
    });
  };

  const renderResourceGroupAssignments = () => {
    if (!resourceGroupAssignments || !resourceGroupAssignments.assignedTo)
      return null;

    return resourceGroupAssignments.assignedTo.map((assignment, index) => {
      if (assignment.type === AssignmentType.DIRECT) {
        return (
          <View key={`direct-${index}`} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Uczniowie (bezpośrednio)
            </ThemedText>
            {assignment.assignmentTargets.map((student) => (
              <View
                key={student.id}
                style={[styles.assignmentItem, { borderColor }]}
              >
                <MaterialIcons name="person" size={20} color={primaryColor} />
                <ThemedText
                  style={[styles.assignmentText, { color: textColor }]}
                >
                  {student.name} {student.surname}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.sourceTag,
                    {
                      backgroundColor: primaryColor + "20",
                      color: primaryColor,
                    },
                  ]}
                >
                  Bezpośrednio
                </ThemedText>
              </View>
            ))}
          </View>
        );
      } else if (assignment.type === AssignmentType.STUDENT_GROUP) {
        return (
          <View key={`group-${index}`} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Grupa: {assignment.name}
            </ThemedText>
            {assignment.assignmentTargets.map((student) => (
              <View
                key={student.id}
                style={[styles.assignmentItem, { borderColor }]}
              >
                <MaterialIcons name="person" size={20} color={errorColor} />
                <ThemedText
                  style={[styles.assignmentText, { color: textColor }]}
                >
                  {student.name} {student.surname}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.sourceTag,
                    { backgroundColor: errorColor + "20", color: errorColor },
                  ]}
                >
                  {assignment.name}
                </ThemedText>
              </View>
            ))}
          </View>
        );
      }
      return null;
    });
  };

  const renderStudentAssignments = () => {
    if (!studentAssignments || !studentAssignments.assignedTo) return null;

    return studentAssignments.assignedTo.map((assignment, index) => {
      if (assignment.type === AssignmentType.DIRECT) {
        return (
          <View key={`direct-${index}`} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Zasoby (bezpośrednio)
            </ThemedText>
            {assignment.assignmentTargets.map((resource) => (
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
                <ThemedText
                  style={[
                    styles.sourceTag,
                    {
                      backgroundColor: primaryColor + "20",
                      color: primaryColor,
                    },
                  ]}
                >
                  Bezpośrednio
                </ThemedText>
              </View>
            ))}
          </View>
        );
      } else if (assignment.type === AssignmentType.RESOURCE_GROUP) {
        return (
          <View key={`rg-${index}`} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Grupa zasobów: {assignment.name}
            </ThemedText>
            {assignment.assignmentTargets.map((resource) => (
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
                <ThemedText
                  style={[
                    styles.sourceTag,
                    {
                      backgroundColor: primaryColor + "20",
                      color: primaryColor,
                    },
                  ]}
                >
                  {assignment.name}
                </ThemedText>
              </View>
            ))}
          </View>
        );
      } else if (assignment.type === AssignmentType.STUDENT_GROUP) {
        // Inherited from student group
        return (
          <View key={`sg-${index}`} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Odziedziczone z grupy: {assignment.name}
            </ThemedText>
            {assignment.assignedTo.map((nestedAssignment, nestedIndex) => {
              if (nestedAssignment.type === AssignmentType.DIRECT) {
                return (
                  <View key={`nested-direct-${nestedIndex}`}>
                    {nestedAssignment.assignmentTargets.map((resource) => (
                      <View
                        key={resource.id}
                        style={[
                          styles.nestedItem,
                          { borderColor: borderColor + "50" },
                        ]}
                      >
                        <MaterialIcons
                          name={getFileIcon(resource.fileType, resource.name)}
                          size={18}
                          color={errorColor}
                        />
                        <ThemedText
                          style={[
                            styles.nestedText,
                            { color: textColor + "80" },
                          ]}
                          numberOfLines={1}
                        >
                          {resource.name}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.sourceTag,
                            {
                              backgroundColor: errorColor + "20",
                              color: errorColor,
                              fontSize: 9,
                            },
                          ]}
                        >
                          {assignment.name}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                );
              } else if (
                nestedAssignment.type === AssignmentType.RESOURCE_GROUP
              ) {
                return (
                  <View key={`nested-rg-${nestedIndex}`}>
                    <View
                      style={[
                        styles.nestedItem,
                        { borderColor: borderColor + "50" },
                      ]}
                    >
                      <MaterialIcons
                        name="folder"
                        size={18}
                        color={errorColor}
                      />
                      <ThemedText
                        style={[styles.nestedText, { color: textColor + "80" }]}
                      >
                        {nestedAssignment.name} (
                        {nestedAssignment.assignmentTargets.length} zasobów)
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.sourceTag,
                          {
                            backgroundColor: errorColor + "20",
                            color: errorColor,
                            fontSize: 9,
                          },
                        ]}
                      >
                        {assignment.name}
                      </ThemedText>
                    </View>
                  </View>
                );
              }
              return null;
            })}
          </View>
        );
      }
      return null;
    });
  };

  const renderStudentGroupAssignments = () => {
    if (!studentGroupAssignments || !studentGroupAssignments.assignedTo)
      return null;

    return studentGroupAssignments.assignedTo.map((assignment, index) => {
      if (assignment.type === AssignmentType.DIRECT) {
        return (
          <View key={`direct-${index}`} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Zasoby (bezpośrednio)
            </ThemedText>
            {assignment.assignmentTargets.map((resource) => (
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
                <ThemedText
                  style={[
                    styles.sourceTag,
                    {
                      backgroundColor: primaryColor + "20",
                      color: primaryColor,
                    },
                  ]}
                >
                  Bezpośrednio
                </ThemedText>
              </View>
            ))}
          </View>
        );
      } else if (assignment.type === AssignmentType.RESOURCE_GROUP) {
        return (
          <View key={`rg-${index}`} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Grupa zasobów: {assignment.name}
            </ThemedText>
            {assignment.assignmentTargets.map((resource) => (
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
                <ThemedText
                  style={[
                    styles.sourceTag,
                    {
                      backgroundColor: primaryColor + "20",
                      color: primaryColor,
                    },
                  ]}
                >
                  {assignment.name}
                </ThemedText>
              </View>
            ))}
          </View>
        );
      }
      return null;
    });
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
  groupSection: {
    marginBottom: 12,
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
  sourceTag: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "600",
  },
  nestedItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginLeft: 24,
    borderLeftWidth: 2,
    gap: 8,
    marginBottom: 4,
  },
  nestedText: {
    flex: 1,
    fontSize: 13,
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
