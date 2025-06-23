import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import AddLessonModal from "@/components/Schedule/AddLessonModal";
import ScheduleContainer from "@/components/Schedule/ScheduleContainer";
import { ThemedText } from "@/components/ThemedText";
import ThemedButton from "@/components/ui/ThemedButton";
import { useAuth } from "@/hooks/useAuth";
import { useScheduleApi } from "@/hooks/useScheduleApi";
import { LessonRequest, scheduleApi } from "@/services/scheduleApi";
import { getWeekStartEndDates } from "@/utils/dates";

const WeeklySchedule = () => {
  const [offset, setOffset] = useState(0);
  const { isTutor } = useAuth();
  const {
    scheduleData,
    refetch,
    confirmMeeting,
    deleteLesson,
    editLesson,
    confirmingLessons,
    isLoading,
  } = useScheduleApi(true, offset);
  const [refreshing, setRefreshing] = useState(false);
  const { startDate, endDate } = useMemo(
    () => getWeekStartEndDates({ weekOffset: offset }),
    [offset],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const [addLessonModalVisible, setAddLessonModalVisible] = useState(false);

  const handleAddLesson = async (
    lessonRequest: LessonRequest,
  ): Promise<boolean> => {
    try {
      const success = await scheduleApi.planLesson(lessonRequest);
      if (success) {
        await refetch(offset);
      }
      return success;
    } catch (error) {
      console.error("Failed to add lesson:", error);
      return false;
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.buttonContainer}>
        <ThemedButton
          icon="chevron.left"
          variant="outline"
          size="medium"
          color="primary"
          onPress={() => setOffset(offset - 1)}
        />
        <View>
          <ThemedText type={"primary"} style={styles.title}>
            Plan Lekcji
          </ThemedText>
          {isTutor() && (
            <ThemedButton
              title="Dodaj Lekcję"
              variant="filled"
              size="medium"
              color="primary"
              onPress={() => setAddLessonModalVisible(true)}
            />
          )}
        </View>
        <ThemedButton
          icon="chevron.right"
          variant="outline"
          size="medium"
          color="primary"
          onPress={() => setOffset(offset + 1)}
        />
      </View>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <ThemedText type="secondary" style={styles.loadingText}>
            Ładowanie planu lekcji...
          </ThemedText>
        </View>
      ) : (
        <ScheduleContainer
          scheduleData={scheduleData}
          confirmingLessons={confirmingLessons}
          confirmMeeting={confirmMeeting}
          deleteLesson={deleteLesson}
          editLesson={editLesson}
          onRefresh={onRefresh}
          refreshing={refreshing}
          startDate={startDate}
          endDate={endDate}
        />
      )}
      <AddLessonModal
        visible={addLessonModalVisible}
        onClose={() => setAddLessonModalVisible(false)}
        onSubmit={handleAddLesson}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default WeeklySchedule;
