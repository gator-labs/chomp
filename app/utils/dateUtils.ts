import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

export const ONE_SECOND_IN_MILISECONDS = 1000;
export const ONE_MINUTE_IN_MILISECONDS = ONE_SECOND_IN_MILISECONDS * 60;
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

export const getRevealedAtString = (revealed: Date) => {
  const daysJsRevealed = dayjs(revealed);
  let differenceInMiliseconds = daysJsRevealed.diff(new Date());
  if (differenceInMiliseconds < 0) {
    differenceInMiliseconds *= -1;
  }
  let timeString = "1s";
  if (differenceInMiliseconds > ONE_SECOND_IN_MILISECONDS) {
    timeString = `${Math.floor(differenceInMiliseconds / ONE_SECOND_IN_MILISECONDS)}s`;
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

  if (daysJsRevealed.isBefore(new Date())) {
    return `Revealed ${timeString} ago`;
  }

  return "Revealing in " + timeString;
};

export const getDailyDeckFormamttedString = (date: Date) =>
  dayjs(date).format("MMMM DD YYYY").toString();
