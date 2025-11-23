import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ResourceGroupType } from "@/types/resource";

import ResourceGroupCard from "./ResourceGroupCard";

type ResourceGroupListProps = {
  groups: ResourceGroupType[];
  onDelete: (groupId: string) => Promise<boolean>;
  onEdit: (group: ResourceGroupType) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

const ResourceGroupList = ({
  groups,
  onDelete,
  onEdit,
  refreshing,
  onRefresh,
}: ResourceGroupListProps) => {
  const textColor = useThemeColor({}, "text");

  if (groups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={[styles.emptyText, { color: textColor + "80" }]}>
          Brak grup zasobów. Utwórz nową grupę.
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={groups}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ResourceGroupCard group={item} onDelete={onDelete} onEdit={onEdit} />
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

export default ResourceGroupList;
