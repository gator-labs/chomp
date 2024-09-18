import sendToMixpanel from "@/lib/mixpanel";
import { SaveQuestionRequest } from "../actions/answer";
import { Question } from "../components/Question/Question";
import { MIX_PANEL_EVENTS, MIX_PANEL_METADATA } from "../constants/mixpanel";

export function sendAnswerToMixpanel(
  question: Question,
  event: string,
  deckId?: number | undefined,
  deckVariant?: string | undefined,
  selected?: string | number | undefined,
) {
  sendToMixpanel(
    event === "FIRST_ORDER"
      ? MIX_PANEL_EVENTS.FIRST_ORDER_SELECTED
      : event === "SECOND_ORDER"
        ? MIX_PANEL_EVENTS.SECOND_ORDER_SELECTED
        : MIX_PANEL_EVENTS.QUESTION_LOADED,
    {
      [MIX_PANEL_METADATA.QUESTION_ID]: question.id,
      [MIX_PANEL_METADATA.QUESTION_ANSWER_OPTIONS]: question.questionOptions,
      [MIX_PANEL_METADATA.QUESTION_TEXT]: question.question,
      ...(deckId && { [MIX_PANEL_METADATA.DECK_ID]: deckId }),
      ...(deckVariant && {
        [MIX_PANEL_METADATA.IS_DAILY_DECK]: deckVariant === "daily-deck",
      }),
      ...(selected && {
        [MIX_PANEL_METADATA.QUESTION_ANSWER_SELECTED]: selected,
      }),
    },
  );
}

export function sendAnswerStatusToMixpanel(
  request: SaveQuestionRequest,
  status: "SUCCEEDED" | "FAILED",
) {
  sendToMixpanel(
    status === "SUCCEEDED"
      ? MIX_PANEL_EVENTS.QUESTION_ANSWERED_SUCCEEDED
      : MIX_PANEL_EVENTS.QUESTION_ANSWERED_FAILED,
    {
      [MIX_PANEL_METADATA.QUESTION_ID]: request.questionId,
      [MIX_PANEL_METADATA.DECK_ID]: request.deckId,
      [MIX_PANEL_METADATA.QUESTION_ANSWER_SELECTED]: request.questionOptionId,
      [MIX_PANEL_METADATA.QUESTION_ANSWER_SELECTED_PERCENTAGE]:
        request.percentageGiven,
    },
  );
}
