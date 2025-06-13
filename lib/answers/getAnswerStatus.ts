import { AnswerStatus, QuestionAnswer, QuestionOption } from "@prisma/client";
import { InvalidAnswerError } from "@/lib/error";

type QuestionAnswerForStatus = QuestionAnswer & {
  questionOption: QuestionOption;
};

/*
    This function is used to get the status of an answer.
    - If the answer is not fully answered, it returns Viewed.
    - Considered fully answered if exactly one answer has percentage and one has selected=true.
    - For a single question and user
*/
export default function getAnswerStatus(questionAnswers: QuestionAnswerForStatus[]) {
    if (questionAnswers.length === 0) {
        return AnswerStatus.Viewed;
    }

    // Verify all answers belong to the same user and question
    const firstAnswer = questionAnswers[0];
    const allSameUserAndQuestion = questionAnswers.every(
        (qa) => qa.userId === firstAnswer.userId && 
        qa.questionOption.questionId === firstAnswer.questionOption.questionId
    );

    if (!allSameUserAndQuestion) {
        throw new InvalidAnswerError("All answers must belong to the same user and question");
    }

    // Count how many answers have percentage and selected=true
    const answersWithPercentage = questionAnswers.filter(
    (qa) => qa.percentage !== null
    ).length;
    // Count how many answers have selected=true and percentage=null
    const answersWithSelected = questionAnswers.filter(
    (qa) => qa.selected === true
    ).length;

    // Set status to Submitted only if exactly one answer has percentage and one has selected=true
    const isFullyAnswered = answersWithPercentage === 1 && answersWithSelected === 1
    return isFullyAnswered
        ? AnswerStatus.Submitted
        : AnswerStatus.Viewed;
}
