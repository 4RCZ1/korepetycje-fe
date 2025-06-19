import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  View,
} from "react-native";

import AddStudentModal from "@/components/Students/AddStudentModal";
import StudentCard from "@/components/Students/StudentCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useStudentApi } from "@/hooks/useStudentApi";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StudentType } from "@/services/studentApi";

export default function StudentsScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const {
    students,
    loading,
    error,
    refetch,
    deleteStudent,
    addStudent,
    deletingStudents,
  } = useStudentApi();

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error", "500");

  const handleAddStudent = async (
    studentData: Omit<StudentType, "id">,
  ): Promise<boolean> => {
    return await addStudent(studentData);
  };

  const handleDeleteStudent = async (studentId: string): Promise<boolean> => {
    return await deleteStudent(studentId);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  if (loading && students.length === 0) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            Students
          </ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Loading students...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Students
        </ThemedText>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: primaryColor }]}
          onPress={() => setIsAddModalVisible(true)}
        >
          <ThemedText style={styles.addButtonText}>Add Student</ThemedText>
        </TouchableOpacity>
      </View>

      {error && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: errorColor + "20" },
          ]}
        >
          <ThemedText style={[styles.errorText, { color: errorColor }]}>
            {error}
          </ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: errorColor }]}
            onPress={handleRefresh}
          >
            <ThemedText style={[styles.retryButtonText, { color: errorColor }]}>
              Retry
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {students.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
              No Students Yet
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: textColor + "80" }]}>
              Add your first student to get started
            </ThemedText>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: primaryColor }]}
              onPress={() => setIsAddModalVisible(true)}
            >
              <ThemedText style={styles.emptyButtonText}>
                Add Student
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.studentsContainer}>
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onDelete={handleDeleteStudent}
                isDeleting={deletingStudents.has(student.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AddStudentModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSubmit={handleAddStudent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60, // Account for status bar
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  studentsContainer: {
    paddingTop: 8,
  },
});
