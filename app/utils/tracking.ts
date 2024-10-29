import trackEvent from "@/lib/trackEvent";

import { SaveQuestionRequest } from "../actions/answer";
import { Question } from "../components/Question/Question";
import { TRACKING_EVENTS, TRACKING_METADATA } from "../constants/tracking";

export function trackQuestionAnswer(
  question: Question,
  event: string,
  deckId?: number | undefined,
  deckVariant?: string | undefined,
  selected?: string | number | undefined,
) {
  trackEvent(
    event === "FIRST_ORDER"
      ? TRACKING_EVENTS.FIRST_ORDER_SELECTED
      : event === "SECOND_ORDER"
        ? TRACKING_EVENTS.SECOND_ORDER_SELECTED
        : TRACKING_EVENTS.QUESTION_LOADED,
    {
      [TRACKING_METADATA.QUESTION_ID]: question.id,
      [TRACKING_METADATA.QUESTION_ANSWER_OPTIONS]: question.questionOptions,
      [TRACKING_METADATA.QUESTION_TEXT]: question.question,
      ...(deckId && { [TRACKING_METADATA.DECK_ID]: deckId }),
      ...(deckVariant && {
        [TRACKING_METADATA.IS_DAILY_DECK]: deckVariant === "daily-deck",
      }),
      ...(selected && {
        [TRACKING_METADATA.QUESTION_ANSWER_SELECTED]: selected,
      }),
    },
  );
}

export function trackAnswerStatus(
  request: SaveQuestionRequest,
  status: "SUCCEEDED" | "FAILED",
) {
  trackEvent(
    status === "SUCCEEDED"
      ? TRACKING_EVENTS.QUESTION_ANSWERED_SUCCEEDED
      : TRACKING_EVENTS.QUESTION_ANSWERED_FAILED,
    {
      [TRACKING_METADATA.QUESTION_ID]: request.questionId,
      [TRACKING_METADATA.DECK_ID]: request.deckId,
      [TRACKING_METADATA.QUESTION_ANSWER_SELECTED]: request.questionOptionId,
      [TRACKING_METADATA.QUESTION_ANSWER_SELECTED_PERCENTAGE]:
        request.percentageGiven,
    },
  );
}
