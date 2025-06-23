import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

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
    <>
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
            Weekly Schedule
          </ThemedText>
          {isTutor() && (
            <ThemedButton
              title="Add Lesson"
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
      <AddLessonModal
        visible={addLessonModalVisible}
        onClose={() => setAddLessonModalVisible(false)}
        onSubmit={handleAddLesson}
      />
    </>
  );
};

const styles = StyleSheet.create({
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
  instruction: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
    opacity: 0.8,
  },
});

export default WeeklySchedule;
