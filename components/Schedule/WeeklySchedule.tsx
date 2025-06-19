import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import ScheduleContainer from "@/components/Schedule/ScheduleContainer";
import { ThemedText } from "@/components/ThemedText";
import ThemedButton from "@/components/ui/ThemedButton";
import { useScheduleApi } from "@/hooks/useScheduleApi";
import { getWeekStartEndDates } from "@/utils/dates";

const WeeklySchedule = () => {
  const [offset, setOffset] = useState(0);
  const { scheduleData, refetch, confirmMeeting, confirmingLessons } =
    useScheduleApi(true, offset);
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

  return (
    <>
      <View style={styles.buttonContainer}>
        <ThemedButton
          title="Previous Week"
          variant="outline"
          size="medium"
          color="primary"
          onPress={() => setOffset(offset - 1)}
        />
        <View>
          <ThemedText type={"primary"} style={styles.title}>
            Weekly Schedule
          </ThemedText>
          <ThemedText type={"primary"} style={styles.instruction}>
            Tap pending items (lighter blue) to confirm or reject them
          </ThemedText>
        </View>
        <ThemedButton
          title="Next Week"
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
        onRefresh={onRefresh}
        refreshing={refreshing}
        startDate={startDate}
        endDate={endDate}
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
