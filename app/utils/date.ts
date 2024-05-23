import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export function parseDateToDateDefaultUtc(
  dateTime?: Date,
  hour = 10,
  minute = 0,
): Date | null {
  return dateTime
    ? dayjs(dateTime).set("hour", hour).set("minute", minute).utc(true).toDate()
    : null;
}
