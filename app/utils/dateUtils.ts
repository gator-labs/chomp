import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { Question } from "../components/Deck/Deck";

export const ONE_SECOND_IN_MILISECONDS = 1000;
export const ONE_MINUTE_IN_MILISECONDS = ONE_SECOND_IN_MILISECONDS * 60;
export const ONE_HOUR_IN_MILISECONDS = ONE_MINUTE_IN_MILISECONDS * 60;
export const ONE_DAY_IN_MILISECONDS = ONE_HOUR_IN_MILISECONDS * 24;

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
  let timeString = getTimeString(date);
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
  if (differenceInMilliseconds > ONE_SECOND_IN_MILISECONDS) {
    timeString = `${Math.floor(differenceInMilliseconds / ONE_SECOND_IN_MILISECONDS)}s`;
  }

  if (differenceInMilliseconds > ONE_MINUTE_IN_MILISECONDS) {
    timeString = `${Math.floor(differenceInMilliseconds / ONE_MINUTE_IN_MILISECONDS)}m`;
  }

  if (differenceInMilliseconds > ONE_HOUR_IN_MILISECONDS) {
    timeString = `${Math.floor(differenceInMilliseconds / ONE_HOUR_IN_MILISECONDS)}h`;
  }

  if (differenceInMilliseconds > ONE_DAY_IN_MILISECONDS) {
    timeString = `${Math.floor(differenceInMilliseconds / ONE_DAY_IN_MILISECONDS)}d`;
  }

  return timeString;
};

export const getDailyDeckFormattedString = (date: Date) =>
  dayjs(date).format("MMMM DD YYYY").toString();

export const getDueAt = (durationMilliseconds: number): Date => {
  return dayjs(new Date()).add(durationMilliseconds, "milliseconds").toDate();
};

export const getQuestionsDueAt = (questions: Question[], index: number): Date => {
  return dayjs(new Date())
    .add(questions[index].durationMilliseconds, "milliseconds")
    .toDate();
};
