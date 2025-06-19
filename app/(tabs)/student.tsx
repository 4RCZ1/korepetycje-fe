import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  View,
} from "react-native";

import AddStudentModal from "@/components/Students/AddStudentModal";
import StudentCard from "@/components/Students/StudentCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedButton from "@/components/ui/ThemedButton";
import { useStudentApi } from "@/hooks/useStudentApi";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  StudentUpdateRequestType,
  StudentRequestType,
} from "@/services/studentApi";

export default function StudentsScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const {
    students,
    loading,
    error,
    refetch,
    deleteStudent,
    addStudent,
    updateStudent,
    deletingStudents,
    updatingStudents,
  } = useStudentApi();

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error", "500");

  const handleAddStudent = async (
    studentData: StudentRequestType,
  ): Promise<boolean> => {
    return await addStudent(studentData);
  };

  const handleDeleteStudent = async (studentId: string): Promise<boolean> => {
    return await deleteStudent(studentId);
  };

  const handleUpdateStudent = async (
    studentId: string,
    studentData: StudentUpdateRequestType,
  ): Promise<boolean> => {
    return await updateStudent(studentId, studentData);
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
        <ThemedButton
          title="Add Student"
          variant="filled"
          size="medium"
          color="primary"
          onPress={() => setIsAddModalVisible(true)}
        />
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
          <ThemedButton
            title="Retry"
            variant="outline"
            size="small"
            color="error"
            onPress={handleRefresh}
          />
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
            <ThemedButton
              title="Add Student"
              variant="filled"
              size="large"
              color="primary"
              onPress={() => setIsAddModalVisible(true)}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <View style={styles.studentsContainer}>
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onDelete={handleDeleteStudent}
                onUpdate={handleUpdateStudent}
                isDeleting={deletingStudents.has(student.id)}
                isUpdating={updatingStudents.has(student.id)}
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
    marginTop: 8,
  },
  studentsContainer: {
    paddingTop: 8,
  },
});
