import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
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
import { useResourceApi } from "@/hooks/useResourceApi";
import { useResourceGroups } from "@/hooks/useResourceGroups";
import { useStudentApi } from "@/hooks/useStudentApi";
import { useStudentGroups } from "@/hooks/useStudentGroups";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StudentType } from "@/services/studentApi";
import { ResourceGroupType, ResourceType } from "@/types/resource";
import { StudentGroupType } from "@/types/studentGroup";
import { getFileIcon } from "@/utils/fileHelpers";

type AssignmentMode =
  | "resourceToStudent" // Assign resources/resource groups to students/student groups
  | "studentToResource"; // Assign students/student groups to resources/resource groups

type AssignResourceModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // Pre-selected items for assignment
  preSelectedResources?: ResourceType[];
  preSelectedResourceGroups?: ResourceGroupType[];
  preSelectedStudents?: StudentType[];
  preSelectedStudentGroups?: StudentGroupType[];
  // Mode determines what can be selected
  mode: AssignmentMode;
  title?: string;
};

export default function AssignResourceModal({
  visible,
  onClose,
  onSuccess,
  preSelectedResources = [],
  preSelectedResourceGroups = [],
  preSelectedStudents = [],
  preSelectedStudentGroups = [],
  mode,
  title,
}: AssignResourceModalProps) {
  // Selection state
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set(),
  );
  const [selectedResourceGroups, setSelectedResourceGroups] = useState<
    Set<string>
  >(new Set());
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set(),
  );
  const [selectedStudentGroups, setSelectedStudentGroups] = useState<
    Set<string>
  >(new Set());

  const [activeTab, setActiveTab] = useState<
    "students" | "studentGroups" | "resources" | "resourceGroups"
  >(mode === "resourceToStudent" ? "students" : "resources");

  const [submitting, setSubmitting] = useState(false);

  // API hooks
  const { resources, loading: loadingResources } = useResourceApi();
  const { groups: resourceGroups, isLoading: loadingResourceGroups } =
    useResourceGroups();
  const { students, loading: loadingStudents } = useStudentApi();
  const { groups: studentGroups, isLoading: loadingStudentGroups } =
    useStudentGroups();
  const { createAssignments } = useAssignments();

  // Colors
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");

  // Initialize selections when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedResources(new Set(preSelectedResources.map((r) => r.id)));
      setSelectedResourceGroups(
        new Set(preSelectedResourceGroups.map((rg) => rg.id)),
      );
      setSelectedStudents(new Set(preSelectedStudents.map((s) => s.id)));
      setSelectedStudentGroups(
        new Set(preSelectedStudentGroups.map((sg) => sg.id)),
      );

      // Set active tab based on mode
      if (mode === "resourceToStudent") {
        setActiveTab("students");
      } else {
        setActiveTab("resources");
      }
    }
  }, [
    visible,
    preSelectedResources,
    preSelectedResourceGroups,
    preSelectedStudents,
    preSelectedStudentGroups,
    mode,
  ]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const success = await createAssignments({
        resourceIds: Array.from(selectedResources),
        resourceGroupIds: Array.from(selectedResourceGroups),
        studentIds: Array.from(selectedStudents),
        studentGroupIds: Array.from(selectedStudentGroups),
      });

      if (success) {
        onSuccess?.();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleResource = (id: string) => {
    if (mode === "resourceToStudent" && preSelectedResources.length > 0) return; // Can't change pre-selected
    const newSelected = new Set(selectedResources);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedResources(newSelected);
  };

  const toggleResourceGroup = (id: string) => {
    if (mode === "resourceToStudent" && preSelectedResourceGroups.length > 0)
      return;
    const newSelected = new Set(selectedResourceGroups);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedResourceGroups(newSelected);
  };

  const toggleStudent = (id: string) => {
    if (mode === "studentToResource" && preSelectedStudents.length > 0) return;
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudents(newSelected);
  };

  const toggleStudentGroup = (id: string) => {
    if (mode === "studentToResource" && preSelectedStudentGroups.length > 0)
      return;
    const newSelected = new Set(selectedStudentGroups);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudentGroups(newSelected);
  };

  const hasSelections =
    selectedResources.size > 0 ||
    selectedResourceGroups.size > 0 ||
    selectedStudents.size > 0 ||
    selectedStudentGroups.size > 0;

  const hasValidAssignment =
    (selectedResources.size > 0 || selectedResourceGroups.size > 0) &&
    (selectedStudents.size > 0 || selectedStudentGroups.size > 0);

  const isLoading =
    loadingResources ||
    loadingResourceGroups ||
    loadingStudents ||
    loadingStudentGroups;

  const modalTitle =
    title ||
    (mode === "resourceToStudent" ? "Przypisz do uczniów" : "Przypisz zasoby");

  // Determine which tabs to show based on mode
  const showResourceTabs = mode === "studentToResource";
  const showStudentTabs = mode === "resourceToStudent";

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
            <ThemedText type="subtitle">{modalTitle}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Show pre-selected items summary */}
          {(preSelectedResources.length > 0 ||
            preSelectedResourceGroups.length > 0) && (
            <View style={[styles.summarySection, { borderColor }]}>
              <ThemedText style={styles.summaryLabel}>
                Wybrane zasoby:
              </ThemedText>
              <ThemedText
                style={[styles.summaryText, { color: textColor + "80" }]}
              >
                {[
                  ...preSelectedResources.map((r) => r.name),
                  ...preSelectedResourceGroups.map(
                    (rg) => `[Grupa] ${rg.name}`,
                  ),
                ].join(", ")}
              </ThemedText>
            </View>
          )}

          {(preSelectedStudents.length > 0 ||
            preSelectedStudentGroups.length > 0) && (
            <View style={[styles.summarySection, { borderColor }]}>
              <ThemedText style={styles.summaryLabel}>
                Wybrani uczniowie:
              </ThemedText>
              <ThemedText
                style={[styles.summaryText, { color: textColor + "80" }]}
              >
                {[
                  ...preSelectedStudents.map((s) => `${s.name} ${s.surname}`),
                  ...preSelectedStudentGroups.map((sg) => `[Grupa] ${sg.name}`),
                ].join(", ")}
              </ThemedText>
            </View>
          )}

          {/* Tabs for selection */}
          <View style={[styles.tabsContainer, { borderColor }]}>
            {showStudentTabs && (
              <>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "students" && {
                      borderBottomColor: primaryColor,
                      borderBottomWidth: 2,
                    },
                  ]}
                  onPress={() => setActiveTab("students")}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      activeTab === "students"
                        ? { color: primaryColor, fontWeight: "bold" }
                        : { color: textColor + "80" },
                    ]}
                  >
                    Uczniowie ({selectedStudents.size})
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "studentGroups" && {
                      borderBottomColor: primaryColor,
                      borderBottomWidth: 2,
                    },
                  ]}
                  onPress={() => setActiveTab("studentGroups")}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      activeTab === "studentGroups"
                        ? { color: primaryColor, fontWeight: "bold" }
                        : { color: textColor + "80" },
                    ]}
                  >
                    Grupy ({selectedStudentGroups.size})
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
            {showResourceTabs && (
              <>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "resources" && {
                      borderBottomColor: primaryColor,
                      borderBottomWidth: 2,
                    },
                  ]}
                  onPress={() => setActiveTab("resources")}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      activeTab === "resources"
                        ? { color: primaryColor, fontWeight: "bold" }
                        : { color: textColor + "80" },
                    ]}
                  >
                    Zasoby ({selectedResources.size})
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "resourceGroups" && {
                      borderBottomColor: primaryColor,
                      borderBottomWidth: 2,
                    },
                  ]}
                  onPress={() => setActiveTab("resourceGroups")}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      activeTab === "resourceGroups"
                        ? { color: primaryColor, fontWeight: "bold" }
                        : { color: textColor + "80" },
                    ]}
                  >
                    Grupy ({selectedResourceGroups.size})
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Content based on active tab */}
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={primaryColor}
              style={styles.loader}
            />
          ) : (
            <ScrollView style={styles.listContainer}>
              {/* Students list */}
              {activeTab === "students" && (
                <>
                  {students.length === 0 ? (
                    <ThemedText style={styles.emptyText}>
                      Brak uczniów
                    </ThemedText>
                  ) : (
                    students.map((student) => {
                      const isSelected = selectedStudents.has(student.id);
                      const isPreSelected = preSelectedStudents.some(
                        (s) => s.id === student.id,
                      );
                      return (
                        <TouchableOpacity
                          key={student.id}
                          style={[
                            styles.listItem,
                            {
                              borderColor: isSelected
                                ? primaryColor
                                : borderColor,
                            },
                            isSelected && {
                              backgroundColor: primaryColor + "10",
                            },
                          ]}
                          onPress={() => toggleStudent(student.id)}
                          disabled={isPreSelected}
                        >
                          <MaterialIcons
                            name="person"
                            size={24}
                            color={primaryColor}
                          />
                          <ThemedText
                            style={[styles.itemText, { color: textColor }]}
                          >
                            {student.name} {student.surname}
                          </ThemedText>
                          <View style={[styles.checkbox, { borderColor }]}>
                            {isSelected && (
                              <IconSymbol
                                name="checkmark"
                                size={16}
                                color={primaryColor}
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </>
              )}

              {/* Student Groups list */}
              {activeTab === "studentGroups" && (
                <>
                  {studentGroups.length === 0 ? (
                    <ThemedText style={styles.emptyText}>
                      Brak grup uczniów
                    </ThemedText>
                  ) : (
                    studentGroups.map((group) => {
                      const isSelected = selectedStudentGroups.has(group.id);
                      const isPreSelected = preSelectedStudentGroups.some(
                        (sg) => sg.id === group.id,
                      );
                      return (
                        <TouchableOpacity
                          key={group.id}
                          style={[
                            styles.listItem,
                            {
                              borderColor: isSelected
                                ? primaryColor
                                : borderColor,
                            },
                            isSelected && {
                              backgroundColor: primaryColor + "10",
                            },
                          ]}
                          onPress={() => toggleStudentGroup(group.id)}
                          disabled={isPreSelected}
                        >
                          <MaterialIcons
                            name="people"
                            size={24}
                            color={primaryColor}
                          />
                          <View style={styles.itemContent}>
                            <ThemedText
                              style={[styles.itemText, { color: textColor }]}
                            >
                              {group.name}
                            </ThemedText>
                            <ThemedText
                              style={[
                                styles.itemSubtext,
                                { color: textColor + "60" },
                              ]}
                            >
                              {group.students.length} uczniów
                            </ThemedText>
                          </View>
                          <View style={[styles.checkbox, { borderColor }]}>
                            {isSelected && (
                              <IconSymbol
                                name="checkmark"
                                size={16}
                                color={primaryColor}
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </>
              )}

              {/* Resources list */}
              {activeTab === "resources" && (
                <>
                  {resources.length === 0 ? (
                    <ThemedText style={styles.emptyText}>
                      Brak zasobów
                    </ThemedText>
                  ) : (
                    resources.map((resource) => {
                      const isSelected = selectedResources.has(resource.id);
                      const isPreSelected = preSelectedResources.some(
                        (r) => r.id === resource.id,
                      );
                      return (
                        <TouchableOpacity
                          key={resource.id}
                          style={[
                            styles.listItem,
                            {
                              borderColor: isSelected
                                ? primaryColor
                                : borderColor,
                            },
                            isSelected && {
                              backgroundColor: primaryColor + "10",
                            },
                          ]}
                          onPress={() => toggleResource(resource.id)}
                          disabled={isPreSelected}
                        >
                          <MaterialIcons
                            name={getFileIcon(resource.fileType, resource.name)}
                            size={24}
                            color={primaryColor}
                          />
                          <ThemedText
                            style={[styles.itemText, { color: textColor }]}
                            numberOfLines={1}
                          >
                            {resource.name}
                          </ThemedText>
                          <View style={[styles.checkbox, { borderColor }]}>
                            {isSelected && (
                              <IconSymbol
                                name="checkmark"
                                size={16}
                                color={primaryColor}
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </>
              )}

              {/* Resource Groups list */}
              {activeTab === "resourceGroups" && (
                <>
                  {resourceGroups.length === 0 ? (
                    <ThemedText style={styles.emptyText}>
                      Brak grup zasobów
                    </ThemedText>
                  ) : (
                    resourceGroups.map((group) => {
                      const isSelected = selectedResourceGroups.has(group.id);
                      const isPreSelected = preSelectedResourceGroups.some(
                        (rg) => rg.id === group.id,
                      );
                      return (
                        <TouchableOpacity
                          key={group.id}
                          style={[
                            styles.listItem,
                            {
                              borderColor: isSelected
                                ? primaryColor
                                : borderColor,
                            },
                            isSelected && {
                              backgroundColor: primaryColor + "10",
                            },
                          ]}
                          onPress={() => toggleResourceGroup(group.id)}
                          disabled={isPreSelected}
                        >
                          <MaterialIcons
                            name="folder"
                            size={24}
                            color={primaryColor}
                          />
                          <View style={styles.itemContent}>
                            <ThemedText
                              style={[styles.itemText, { color: textColor }]}
                            >
                              {group.name}
                            </ThemedText>
                            <ThemedText
                              style={[
                                styles.itemSubtext,
                                { color: textColor + "60" },
                              ]}
                            >
                              {group.resources.length} zasobów
                            </ThemedText>
                          </View>
                          <View style={[styles.checkbox, { borderColor }]}>
                            {isSelected && (
                              <IconSymbol
                                name="checkmark"
                                size={16}
                                color={primaryColor}
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </>
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <ThemedButton
              title="Anuluj"
              variant="outline"
              onPress={onClose}
              style={styles.button}
            />
            <ThemedButton
              title="Przypisz"
              variant="filled"
              onPress={handleSubmit}
              loading={submitting}
              disabled={!hasSelections || !hasValidAssignment || submitting}
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
  summarySection: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryLabel: {
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
  },
  listContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  loader: {
    marginVertical: 40,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
  },
  itemSubtext: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
});
