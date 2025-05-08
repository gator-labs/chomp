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
  startDateOfTheWeek.setUTCHours(0, 0, 0, 0);

  const endDateOfTheWeek = endOfWeek(date, { weekStartsOn: 1 });
  endDateOfTheWeek.setUTCHours(23, 59, 59, 999);

  return {
    startDateOfTheWeek,
    endDateOfTheWeek,
  };
};

/**
 * returns start and end of the current UTC day
 */
export const getStartAndEndOfDay = (
  date: Date,
): {
  startOfTheDay: Date;
  endOfTheDay: Date;
} => {
  const startOfTheDay = new Date(date);
  startOfTheDay.setUTCHours(0, 0, 0, 0);

  const endOfTheDay = new Date(date);
  endOfTheDay.setUTCHours(23, 59, 59, 999);

  return {
    startOfTheDay,
    endOfTheDay,
  };
};

export const formatDate = (date: Date | string) => {
  const value = new Date(date);

  const dateVal = [
    value.getUTCFullYear(),
    (1 + value.getUTCMonth()).toString().padStart(2, "0"),
    value.getUTCDate().toString().padStart(2, "0"),
  ].join("-");

  const timeVal = [
    value.getUTCHours().toString().padStart(2, "0"),
    value.getUTCMinutes().toString().padStart(2, "0"),
    value.getUTCSeconds().toString().padStart(2, "0"),
  ].join(":");

  return `${dateVal} ${timeVal}`;
};

/**
 * Returns a date at the beginning of yesterday in UTC
 **/
export const yesterdayStartUTC = (): Date => {
  return dayjs().utc().subtract(1, "day").startOf("day").toDate();
};

/**
 * Returns a date at the beginning of today in UTC
 **/
export const todayStartUTC = (): Date => {
  return dayjs().utc().startOf("day").toDate();
};
