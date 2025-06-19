import React, { useMemo, useState } from "react";
import { StyleSheet, Button, View } from "react-native";

import ScheduleContainer from "@/components/Schedule/ScheduleContainer";
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
        <Button title="Previous Week" onPress={() => setOffset(offset - 1)} />
        <Button title="Next Week" onPress={() => setOffset(offset + 1)} />
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
});

export default WeeklySchedule;
