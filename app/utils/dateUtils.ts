import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

export const ONE_SECOND_IN_MILLISECONDS = 1000;
export const ONE_MINUTE_IN_MILLISECONDS = ONE_SECOND_IN_MILLISECONDS * 60;
export const ONE_HOUR_IN_MILLISECONDS = ONE_MINUTE_IN_MILLISECONDS * 60;
export const ONE_DAY_IN_MILLISECONDS = ONE_HOUR_IN_MILLISECONDS * 24;

dayjs.extend(duration);
export const getDueAtString = (dueAt: Date) => {
  const milliseconds = dayjs(dueAt).diff(new Date());
  if (milliseconds <= 0) {
    return "0:00";
  }

  return dayjs.duration(milliseconds).format("m:ss");
};

export const getRevealedAtString = (date: Date) => {
  const daysJsDate = dayjs(date);
  let differenceInMilliseconds = daysJsDate.diff(new Date());
  if (differenceInMilliseconds < 0) {
    differenceInMilliseconds *= -1;
  }
  const timeString = getTimeString(date);
  if (daysJsDate.isBefore(new Date())) {
    return `Revealed ${timeString} ago`;
  }

  return "Revealing in " + timeString;
};

export const getTimeString = (date: Date) => {
  const daysJsDate = dayjs(date);
  let differenceInMilliseconds = daysJsDate.diff(new Date());
  if (differenceInMilliseconds < 0) {
    differenceInMilliseconds *= -1;
  }
  let timeString = "1s";
  if (differenceInMilliseconds > ONE_SECOND_IN_MILLISECONDS) {
    timeString = `${Math.floor(differenceInMilliseconds / ONE_SECOND_IN_MILLISECONDS)}s`;
  }

  if (differenceInMilliseconds > ONE_MINUTE_IN_MILLISECONDS) {
    timeString = `${Math.floor(differenceInMilliseconds / ONE_MINUTE_IN_MILLISECONDS)}m`;
  }

  if (differenceInMilliseconds > ONE_HOUR_IN_MILLISECONDS) {
    timeString = `${Math.floor(differenceInMilliseconds / ONE_HOUR_IN_MILLISECONDS)}h`;
  }

  if (differenceInMilliseconds > ONE_DAY_IN_MILLISECONDS) {
    timeString = `${Math.floor(differenceInMilliseconds / ONE_DAY_IN_MILLISECONDS)}d`;
  }

  return timeString;
};

export const getDailyDeckFormattedString = (date: Date) =>
  dayjs(date).format("MMMM DD YYYY").toString();
