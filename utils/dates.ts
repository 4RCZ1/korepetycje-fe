export const getWeekStartEndDates = ({
  date,
  weekOffset = 0,
}: {
  date?: Date;
  weekOffset?: number;
}): { startDate: Date; endDate: Date } => {
  const today = date ?? new Date();
  const startDate = new Date(today);
  startDate.setDate(
    today.getDate() - (today.getDay() || 7) + 1 + weekOffset * 7,
  );
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};
