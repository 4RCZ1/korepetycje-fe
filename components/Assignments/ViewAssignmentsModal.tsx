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
      return resourceAssignments.assignedTo.length > 0;
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
        studentAssignments.studentGroups.length > 0
      );
    }
    if (viewMode.type === "studentGroup" && studentGroupAssignments) {
      return (
        studentGroupAssignments.directResources.length > 0 ||
        studentGroupAssignments.resourceGroups.length > 0
      );
    }
    return false;
  };

  const renderResourceAssignments = () => {
    if (!resourceAssignments || !resourceAssignments.assignedTo) return null;

    return (
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          Przypisani uczniowie
        </ThemedText>
        {resourceAssignments.assignedTo.map((student) => (
          <View
            key={student.id}
            style={[styles.assignmentItem, { borderColor }]}
          >
            <MaterialIcons name="person" size={20} color={primaryColor} />
            <ThemedText style={[styles.assignmentText, { color: textColor }]}>
              {student.name} {student.surname}
            </ThemedText>
          </View>
        ))}
      </View>
    );
  };

  const renderResourceGroupAssignments = () => {
    if (!resourceGroupAssignments) return null;

    const hasAnyAssignments =
      resourceGroupAssignments.directStudents.length > 0 ||
      resourceGroupAssignments.studentGroups.length > 0;

    if (!hasAnyAssignments) {
      return (
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Przypisani uczniowie
          </ThemedText>
          <ThemedText style={{ color: textColor, fontStyle: "italic" }}>
            Brak przypisań
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        {/* Direct Students */}
        {resourceGroupAssignments.directStudents.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Uczniowie przypisani bezpośrednio
            </ThemedText>
            {resourceGroupAssignments.directStudents.map((student) => (
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
              </View>
            ))}
          </View>
        )}

        {/* Student Groups */}
        {resourceGroupAssignments.studentGroups.length > 0 && (
          <View>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Grupy uczniów
            </ThemedText>
            {resourceGroupAssignments.studentGroups.map((sg) => (
              <View key={sg.id} style={{ marginBottom: 12 }}>
                <ThemedText
                  style={{
                    color: primaryColor,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  👥 {sg.name} ({sg.students.length} uczniów)
                </ThemedText>
                {sg.students.map((student) => (
                  <View
                    key={student.id}
                    style={[
                      styles.assignmentItem,
                      { borderColor, marginLeft: 16 },
                    ]}
                  >
                    <MaterialIcons
                      name="person"
                      size={18}
                      color={primaryColor}
                    />
                    <ThemedText
                      style={[styles.assignmentText, { color: textColor }]}
                    >
                      {student.name} {student.surname}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderStudentAssignments = () => {
    if (!studentAssignments) return null;

    const hasAnyResources =
      studentAssignments.directResources.length > 0 ||
      studentAssignments.resourceGroups.length > 0 ||
      studentAssignments.studentGroups.some(
        (sg) => sg.directResources.length > 0 || sg.resourceGroups.length > 0,
      );

    if (!hasAnyResources) {
      return (
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Przypisane zasoby
          </ThemedText>
          <ThemedText style={{ color: textColor, fontStyle: "italic" }}>
            Brak przypisanych zasobów
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        {/* Direct Resources */}
        {studentAssignments.directResources.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Zasoby przypisane bezpośrednio
            </ThemedText>
            {studentAssignments.directResources.map((resource) => (
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
        )}

        {/* Direct Resource Groups */}
        {studentAssignments.resourceGroups.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Grupy zasobów przypisane bezpośrednio
            </ThemedText>
            {studentAssignments.resourceGroups.map((rg) => (
              <View key={rg.id} style={{ marginBottom: 12 }}>
                <ThemedText
                  style={{
                    color: primaryColor,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  📦 {rg.name} ({rg.resources.length} plików)
                </ThemedText>
                {rg.resources.map((resource) => (
                  <View
                    key={resource.id}
                    style={[
                      styles.assignmentItem,
                      { borderColor, marginLeft: 16 },
                    ]}
                  >
                    <MaterialIcons
                      name={getFileIcon(resource.fileType, resource.name)}
                      size={18}
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
            ))}
          </View>
        )}

        {/* Student Groups */}
        {studentAssignments.studentGroups.length > 0 && (
          <View>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Poprzez grupy uczniów
            </ThemedText>
            {studentAssignments.studentGroups.map((sg) => (
              <View key={sg.id} style={{ marginBottom: 16 }}>
                <ThemedText
                  style={{
                    color: primaryColor,
                    fontWeight: "bold",
                    marginBottom: 8,
                  }}
                >
                  👥 {sg.name}
                </ThemedText>

                {/* Direct resources in this student group */}
                {sg.directResources.length > 0 && (
                  <View style={{ marginLeft: 16, marginBottom: 8 }}>
                    <ThemedText
                      style={{
                        color: textColor,
                        fontWeight: "600",
                        fontSize: 12,
                        marginBottom: 4,
                      }}
                    >
                      Zasoby bezpośrednie:
                    </ThemedText>
                    {sg.directResources.map((resource) => (
                      <View
                        key={resource.id}
                        style={[styles.assignmentItem, { borderColor }]}
                      >
                        <MaterialIcons
                          name={getFileIcon(resource.fileType, resource.name)}
                          size={18}
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
                )}

                {/* Resource groups in this student group */}
                {sg.resourceGroups.length > 0 && (
                  <View style={{ marginLeft: 16 }}>
                    <ThemedText
                      style={{
                        color: textColor,
                        fontWeight: "600",
                        fontSize: 12,
                        marginBottom: 4,
                      }}
                    >
                      Grupy zasobów:
                    </ThemedText>
                    {sg.resourceGroups.map((rg) => (
                      <View key={rg.id} style={{ marginBottom: 8 }}>
                        <ThemedText
                          style={{
                            color: primaryColor,
                            fontWeight: "500",
                            fontSize: 12,
                            marginBottom: 4,
                          }}
                        >
                          📦 {rg.name} ({rg.resources.length} plików)
                        </ThemedText>
                        {rg.resources.map((resource) => (
                          <View
                            key={resource.id}
                            style={[
                              styles.assignmentItem,
                              { borderColor, marginLeft: 8 },
                            ]}
                          >
                            <MaterialIcons
                              name={getFileIcon(
                                resource.fileType,
                                resource.name,
                              )}
                              size={16}
                              color={primaryColor}
                            />
                            <ThemedText
                              style={[
                                styles.assignmentText,
                                { color: textColor, fontSize: 12 },
                              ]}
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
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderStudentGroupAssignments = () => {
    if (!studentGroupAssignments) return null;

    const hasAnyAssignments =
      studentGroupAssignments.directResources.length > 0 ||
      studentGroupAssignments.resourceGroups.length > 0;

    if (!hasAnyAssignments) {
      return (
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Przypisane zasoby
          </ThemedText>
          <ThemedText style={{ color: textColor, fontStyle: "italic" }}>
            Brak przypisanych zasobów
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        {/* Direct Resources */}
        {studentGroupAssignments.directResources.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Zasoby przypisane bezpośrednio
            </ThemedText>
            {studentGroupAssignments.directResources.map((resource) => (
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
        )}

        {/* Resource Groups */}
        {studentGroupAssignments.resourceGroups.length > 0 && (
          <View>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Grupy zasobów
            </ThemedText>
            {studentGroupAssignments.resourceGroups.map((rg) => (
              <View key={rg.id} style={{ marginBottom: 12 }}>
                <ThemedText
                  style={{
                    color: primaryColor,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  📦 {rg.name} ({rg.resources.length} plików)
                </ThemedText>
                {rg.resources.map((resource) => (
                  <View
                    key={resource.id}
                    style={[
                      styles.assignmentItem,
                      { borderColor, marginLeft: 16 },
                    ]}
                  >
                    <MaterialIcons
                      name={getFileIcon(resource.fileType, resource.name)}
                      size={18}
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
            ))}
          </View>
        )}
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
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  button: {
    minWidth: 100,
  },
});
