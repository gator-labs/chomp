import { endOfWeek, startOfWeek } from "date-fns";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export function parseDateToDateDefaultUtc(
  dateTime?: Date,
  hour = 14,
  minute = 0,
): Date | null {
  return dateTime
    ? dayjs(dateTime).set("hour", hour).set("minute", minute).utc(true).toDate()
    : null;
}

export const getWeekStartAndEndDates = (
  date: Date,
): { startDateOfTheWeek: Date; endDateOfTheWeek: Date } => {
  const startDateOfTheWeek = startOfWeek(date, { weekStartsOn: 1 });
  startDateOfTheWeek.setUTCHours(23, 59, 59, 999);

  const endDateOfTheWeek = endOfWeek(date, { weekStartsOn: 1 });
  endDateOfTheWeek.setUTCHours(23, 59, 59, 999);

  return {
    startDateOfTheWeek,
    endDateOfTheWeek,
  };
};

export const getStartAndEndOfDay = (
  date: Date,
): {
  startOfTheDay: Date;
  endOfTheDay: Date;
} => {
  var startOfTheDay = new Date(date);
  startOfTheDay.setUTCHours(0, 0, 0, 0);

  var endOfTheDay = new Date(date);
  endOfTheDay.setUTCHours(23, 59, 59, 999);

  return {
    startOfTheDay,
    endOfTheDay,
  };
};
