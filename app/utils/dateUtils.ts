import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

export const ONE_SECOND_IN_MILLISECONDS = 1000;
export const ONE_MINUTE_IN_MILISECONDS = ONE_SECOND_IN_MILLISECONDS * 60;
export const ONE_HOUR_IN_MILISECONDS = ONE_MINUTE_IN_MILISECONDS * 60;
export const ONE_DAY_IN_MILISECONDS = ONE_HOUR_IN_MILISECONDS * 24;

dayjs.extend(duration);
export const getDueAtString = (dueAt: Date) => {
  const miliseconds = dayjs(dueAt).diff(new Date());
  if (miliseconds <= 0) {
    return "0:00";
  }

  return dayjs.duration(miliseconds).format("m:ss");
};

export const getRevealedAtString = (date: Date) => {
  const daysJsDate = dayjs(date);
  let differenceInMiliseconds = daysJsDate.diff(new Date());
  if (differenceInMiliseconds < 0) {
    differenceInMiliseconds *= -1;
  }
  let timeString = getTimeString(date);
  if (daysJsDate.isBefore(new Date())) {
    return `Revealed ${timeString} ago`;
  }

  return "Revealing in " + timeString;
};

export const getTimeString = (date: Date) => {
  const daysJsDate = dayjs(date);
  let differenceInMiliseconds = daysJsDate.diff(new Date());
  if (differenceInMiliseconds < 0) {
    differenceInMiliseconds *= -1;
  }
  let timeString = "1s";
  if (differenceInMiliseconds > ONE_SECOND_IN_MILLISECONDS) {
    timeString = `${Math.floor(differenceInMiliseconds / ONE_SECOND_IN_MILLISECONDS)}s`;
  }

  if (differenceInMiliseconds > ONE_MINUTE_IN_MILISECONDS) {
    timeString = `${Math.floor(differenceInMiliseconds / ONE_MINUTE_IN_MILISECONDS)}m`;
  }

  if (differenceInMiliseconds > ONE_HOUR_IN_MILISECONDS) {
    timeString = `${Math.floor(differenceInMiliseconds / ONE_HOUR_IN_MILISECONDS)}h`;
  }

  if (differenceInMiliseconds > ONE_DAY_IN_MILISECONDS) {
    timeString = `${Math.floor(differenceInMiliseconds / ONE_DAY_IN_MILISECONDS)}d`;
  }

  return timeString;
};

export const getDailyDeckFormattedString = (date: Date) =>
  dayjs(date).format("MMMM DD YYYY").toString();
