import React from "react";
import { View, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";

export default function StudentGroupList() {
  return (
    <View style={styles.container}>
      <ThemedText>Student Groups Component (Empty)</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
});
