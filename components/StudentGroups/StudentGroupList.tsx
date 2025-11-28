import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StudentGroupType } from "@/types/studentGroup";

import StudentGroupCard from "./StudentGroupCard";

type StudentGroupListProps = {
  groups?: StudentGroupType[];
  onDelete?: (groupId: string) => Promise<boolean>;
  onEdit?: (group: StudentGroupType) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

const StudentGroupList = ({
  groups = [],
  onDelete,
  onEdit,
  refreshing,
  onRefresh,
}: StudentGroupListProps) => {
  const textColor = useThemeColor({}, "text");

  if (groups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={[styles.emptyText, { color: textColor + "80" }]}>
          Brak grup uczniów. Utwórz nową grupę.
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={groups}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StudentGroupCard 
          group={item} 
          onDelete={onDelete || (async () => false)} 
          onEdit={onEdit || (() => {})} 
        />
      )}
      contentContainerStyle={styles.listContent}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100, // Space for FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
  },
});

export default StudentGroupList;
