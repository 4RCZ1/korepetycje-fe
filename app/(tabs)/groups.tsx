import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import ResourceGroupList from "@/components/ResourceGroups/ResourceGroupList";
import ResourceGroupModal from "@/components/ResourceGroups/ResourceGroupModal";
import StudentGroupList from "@/components/StudentGroups/StudentGroupList";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedButton from "@/components/ui/ThemedButton";
import { useResourceGroups } from "@/hooks/useResourceGroups";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ResourceGroupType, ResourceType } from "@/types/resource";

export default function GroupsScreen() {
  const [activeTab, setActiveTab] = useState<
    "resourceGroups" | "studentGroups"
  >("resourceGroups");
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<
    ResourceGroupType | undefined
  >(undefined);

  const {
    groups,
    isLoading: loadingGroups,
    error: errorGroups,
    refreshGroups,
    addGroup,
    updateGroup,
    deleteGroup,
  } = useResourceGroups();

  // Colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error", "500");
  const borderColor = useThemeColor({}, "border");

  const handleRefresh = async () => {
    if (activeTab === "resourceGroups") {
      await refreshGroups();
    }
    // Add refresh logic for student groups later
  };

  const handleGroupSubmit = async (
    name: string,
    selectedResources: ResourceType[],
  ) => {
    if (editingGroup) {
      return await updateGroup(editingGroup.id, name, selectedResources);
    } else {
      return await addGroup(name, selectedResources);
    }
  };

  const openCreateGroupModal = () => {
    setEditingGroup(undefined);
    setIsGroupModalVisible(true);
  };

  const openEditGroupModal = (group: ResourceGroupType) => {
    setEditingGroup(group);
    setIsGroupModalVisible(true);
  };

  if (loadingGroups && groups.length === 0 && activeTab === "resourceGroups") {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            Grupy
          </ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Ładowanie...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Grupy
        </ThemedText>
        {activeTab === "resourceGroups" && (
          <ThemedButton
            title="Nowa Grupa"
            variant="filled"
            size="medium"
            color="primary"
            onPress={openCreateGroupModal}
          />
        )}
      </View>

      <View style={[styles.tabsContainer, { borderBottomColor: borderColor }]}>
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
            Grupy Zasobów
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
            Grupy Uczniów
          </ThemedText>
        </TouchableOpacity>
      </View>

      {errorGroups && activeTab === "resourceGroups" && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: errorColor + "20" },
          ]}
        >
          <ThemedText style={[styles.errorText, { color: errorColor }]}>
            {errorGroups}
          </ThemedText>
          <ThemedButton
            title="Ponów"
            variant="outline"
            size="small"
            color="error"
            onPress={handleRefresh}
          />
        </View>
      )}

      {activeTab === "resourceGroups" ? (
        <ResourceGroupList
          groups={groups}
          onDelete={deleteGroup}
          onEdit={openEditGroupModal}
          refreshing={loadingGroups}
          onRefresh={handleRefresh}
        />
      ) : (
        <StudentGroupList />
      )}

      <ResourceGroupModal
        visible={isGroupModalVisible}
        onClose={() => setIsGroupModalVisible(false)}
        onSubmit={handleGroupSubmit}
        initialGroup={editingGroup}
        title={editingGroup ? "Edytuj Grupę" : "Nowa Grupa"}
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
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  tabText: {
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
});
