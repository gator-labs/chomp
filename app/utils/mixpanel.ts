import sendToMixpanel from "@/lib/mixpanel";
import { Question } from "../components/Question/Question";
import { MIX_PANEL_EVENTS, MIX_PANEL_METADATA } from "../constants/mixpanel";

export function sendAnswerToMixpanel(
  question: Question,
  order: string,
  deckId?: number,
  deckVariant?: string,
) {
  sendToMixpanel(
    order === "FIRST_ORDER"
      ? MIX_PANEL_EVENTS.FIRST_ORDER_SELECTED
      : MIX_PANEL_EVENTS.SECOND_ORDER_SELECTED,
    {
      [MIX_PANEL_METADATA.QUESTION_ID]: question.id,
      [MIX_PANEL_METADATA.QUESTION_ANSWER_OPTIONS]: question.questionOptions,
      [MIX_PANEL_METADATA.QUESTION_TEXT]: question.question,
      ...(deckId && { [MIX_PANEL_METADATA.DECK_ID]: deckId }),
      ...(deckVariant && {
        [MIX_PANEL_METADATA.IS_DAILY_DECK]: deckVariant === "daily-deck",
      }),
    },
  );
}

export function sendAnswerStatusToMixpanel(
  request: {
    questionId: number;
    deckId: number;
    questionOptionId: number;
  },
  status: "SUCCEEDED" | "FAILED",
) {
  sendToMixpanel(
    status === "SUCCEEDED"
      ? MIX_PANEL_EVENTS.QUESTION_ANSWERED_SUCCEEDED
      : MIX_PANEL_EVENTS.QUESTION_ANSWERED_FAILED,
    {
      [MIX_PANEL_METADATA.QUESTION_ID]: request.questionId,
      [MIX_PANEL_METADATA.DECK_ID]: request.deckId,
      [MIX_PANEL_METADATA.QUESTION_ANSWER_OPTIONS]: request.questionOptionId,
    },
  );
}
