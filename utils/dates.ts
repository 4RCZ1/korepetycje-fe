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

export const getFormatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getFormatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};
