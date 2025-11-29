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
};

export default function ViewAssignmentsModal({
  visible,
  onClose,
  onAssignmentsChanged: _onAssignmentsChanged,
  viewMode,
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
  }, [
    viewMode,
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
        resourceAssignments.assignments.directStudents.length > 0 ||
        resourceAssignments.assignments.studentGroups.length > 0
      );
    }
    if (viewMode.type === "resourceGroup" && resourceGroupAssignments) {
      return (
        resourceGroupAssignments.assignments.directStudents.length > 0 ||
        resourceGroupAssignments.assignments.studentGroups.length > 0
      );
    }
    if (viewMode.type === "student" && studentAssignments) {
      return (
        studentAssignments.assignments.directResources.length > 0 ||
        studentAssignments.assignments.resourceGroups.length > 0 ||
        studentAssignments.assignments.inheritedFromGroups.length > 0
      );
    }
    if (viewMode.type === "studentGroup" && studentGroupAssignments) {
      return (
        studentGroupAssignments.assignments.directResources.length > 0 ||
        studentGroupAssignments.assignments.resourceGroups.length > 0
      );
    }
    return false;
  };

  const renderResourceAssignments = () => {
    if (!resourceAssignments) return null;
    const { directStudents, studentGroups } = resourceAssignments.assignments;

    return (
      <>
        {directStudents.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Uczniowie (bezpośrednio)
            </ThemedText>
            {directStudents.map((student) => (
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
        )}

        {studentGroups.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Grupy uczniów
            </ThemedText>
            {studentGroups.map(({ group, students }) => (
              <View key={group.id} style={styles.groupSection}>
                <View style={[styles.assignmentItem, { borderColor }]}>
                  <MaterialIcons name="people" size={20} color={primaryColor} />
                  <ThemedText
                    style={[styles.assignmentText, { color: textColor }]}
                  >
                    {group.name}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.sourceTag,
                      { backgroundColor: errorColor + "20", color: errorColor },
                    ]}
                  >
                    Grupa ({students.length})
                  </ThemedText>
                </View>
                {students.map((student) => (
                  <View
                    key={student.id}
                    style={[
                      styles.nestedItem,
                      { borderColor: borderColor + "50" },
                    ]}
                  >
                    <MaterialIcons
                      name="person-outline"
                      size={18}
                      color={textColor + "80"}
                    />
                    <ThemedText
                      style={[styles.nestedText, { color: textColor + "80" }]}
                    >
                      {student.name} {student.surname}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  const renderResourceGroupAssignments = () => {
    if (!resourceGroupAssignments) return null;
    const { directStudents, studentGroups } =
      resourceGroupAssignments.assignments;

    return (
      <>
        {directStudents.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Uczniowie (bezpośrednio)
            </ThemedText>
            {directStudents.map((student) => (
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
        )}

        {studentGroups.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Grupy uczniów
            </ThemedText>
            {studentGroups.map(({ group, students }) => (
              <View key={group.id} style={styles.groupSection}>
                <View style={[styles.assignmentItem, { borderColor }]}>
                  <MaterialIcons name="people" size={20} color={primaryColor} />
                  <ThemedText
                    style={[styles.assignmentText, { color: textColor }]}
                  >
                    {group.name}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.sourceTag,
                      { backgroundColor: errorColor + "20", color: errorColor },
                    ]}
                  >
                    Grupa ({students.length})
                  </ThemedText>
                </View>
                {students.map((student) => (
                  <View
                    key={student.id}
                    style={[
                      styles.nestedItem,
                      { borderColor: borderColor + "50" },
                    ]}
                  >
                    <MaterialIcons
                      name="person-outline"
                      size={18}
                      color={textColor + "80"}
                    />
                    <ThemedText
                      style={[styles.nestedText, { color: textColor + "80" }]}
                    >
                      {student.name} {student.surname}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  const renderStudentAssignments = () => {
    if (!studentAssignments) return null;
    const { directResources, resourceGroups, inheritedFromGroups } =
      studentAssignments.assignments;

    return (
      <>
        {directResources.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Zasoby (bezpośrednio)
            </ThemedText>
            {directResources.map((resource) => (
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
        )}

        {resourceGroups.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Grupy zasobów (bezpośrednio)
            </ThemedText>
            {resourceGroups.map((group) => (
              <View key={group.id} style={styles.groupSection}>
                <View style={[styles.assignmentItem, { borderColor }]}>
                  <MaterialIcons name="folder" size={20} color={primaryColor} />
                  <ThemedText
                    style={[styles.assignmentText, { color: textColor }]}
                  >
                    {group.name}
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
                {group.resources.map((resource) => (
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
                      color={textColor + "80"}
                    />
                    <ThemedText
                      style={[styles.nestedText, { color: textColor + "80" }]}
                      numberOfLines={1}
                    >
                      {resource.name}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {inheritedFromGroups.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Odziedziczone z grup uczniów
            </ThemedText>
            {inheritedFromGroups.map(
              ({ group, resources, resourceGroups: rGroups }) => (
                <View key={group.id} style={styles.groupSection}>
                  <View style={[styles.assignmentItem, { borderColor }]}>
                    <MaterialIcons name="people" size={20} color={errorColor} />
                    <ThemedText
                      style={[styles.assignmentText, { color: textColor }]}
                    >
                      {group.name}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.sourceTag,
                        {
                          backgroundColor: errorColor + "20",
                          color: errorColor,
                        },
                      ]}
                    >
                      Dziedziczone
                    </ThemedText>
                  </View>
                  {resources.map((resource) => (
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
                        color={textColor + "80"}
                      />
                      <ThemedText
                        style={[styles.nestedText, { color: textColor + "80" }]}
                        numberOfLines={1}
                      >
                        {resource.name}
                      </ThemedText>
                    </View>
                  ))}
                  {rGroups.map((rg) => (
                    <View
                      key={rg.id}
                      style={[
                        styles.nestedItem,
                        { borderColor: borderColor + "50" },
                      ]}
                    >
                      <MaterialIcons
                        name="folder-open"
                        size={18}
                        color={textColor + "80"}
                      />
                      <ThemedText
                        style={[styles.nestedText, { color: textColor + "80" }]}
                      >
                        {rg.name} ({rg.resources.length} zasobów)
                      </ThemedText>
                    </View>
                  ))}
                </View>
              ),
            )}
          </View>
        )}
      </>
    );
  };

  const renderStudentGroupAssignments = () => {
    if (!studentGroupAssignments) return null;
    const { directResources, resourceGroups } =
      studentGroupAssignments.assignments;

    return (
      <>
        {directResources.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Zasoby (bezpośrednio)
            </ThemedText>
            {directResources.map((resource) => (
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
        )}

        {resourceGroups.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Grupy zasobów
            </ThemedText>
            {resourceGroups.map((group) => (
              <View key={group.id} style={styles.groupSection}>
                <View style={[styles.assignmentItem, { borderColor }]}>
                  <MaterialIcons name="folder" size={20} color={primaryColor} />
                  <ThemedText
                    style={[styles.assignmentText, { color: textColor }]}
                  >
                    {group.name}
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
                {group.resources.map((resource) => (
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
                      color={textColor + "80"}
                    />
                    <ThemedText
                      style={[styles.nestedText, { color: textColor + "80" }]}
                      numberOfLines={1}
                    >
                      {resource.name}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </>
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
