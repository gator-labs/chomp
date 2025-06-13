import { AnswerStatus } from "@prisma/client";
import getAnswerStatus from "@/lib/answers/getAnswerStatus";
import { InvalidAnswerError } from "@/lib/error";

describe("getAnswerStatus", () => {
  const userId = "user123";

  // Helper to create a valid answer object for tests
  const createTestAnswer = (
    id: number,
    questionId: number,
    questionOptionId: number,
    selected: boolean,
    percentage: number | null
  ): any => ({
    id,
    userId,
    questionOptionId,
    selected,
    percentage,
    questionOption: { questionId },
    status: AnswerStatus.Viewed,
    isAssigned2ndOrderOption: false,
    timeToAnswer: null,
    score: null,
    weight: 1,
    uuid: `uuid${id}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it("returns Viewed for empty array", () => {
    const result = getAnswerStatus([]);
    expect(result).toBe(AnswerStatus.Viewed);
  });

  it("throws InvalidAnswerError if answers belong to different users", () => {
    const answers = [
      { ...createTestAnswer(1, 1, 1, true, null), userId: "user1" },
      { ...createTestAnswer(2, 1, 2, false, 50), userId: "user2" },
    ];
    expect(() => getAnswerStatus(answers)).toThrow(InvalidAnswerError);
    expect(() => getAnswerStatus(answers)).toThrow(
      "All answers must belong to the same user and question"
    );
  });

  it("throws InvalidAnswerError if answers belong to different questions", () => {
    const answers = [
      createTestAnswer(1, 1, 1, true, null),
      createTestAnswer(2, 2, 2, false, 50),
    ];
    expect(() => getAnswerStatus(answers)).toThrow(InvalidAnswerError);
    expect(() => getAnswerStatus(answers)).toThrow(
      "All answers must belong to the same user and question"
    );
  });

  it("returns Viewed when no answer has percentage", () => {
    const answers = [
      createTestAnswer(1, 1, 1, true, null),
      createTestAnswer(2, 1, 2, false, null),
    ];
    const result = getAnswerStatus(answers);
    expect(result).toBe(AnswerStatus.Viewed);
  });

  it("returns Viewed when no answer is selected", () => {
    const answers = [
      createTestAnswer(1, 1, 1, false, 50),
      createTestAnswer(2, 1, 2, false, null),
    ];
    const result = getAnswerStatus(answers);
    expect(result).toBe(AnswerStatus.Viewed);
  });

  it("returns Viewed when multiple answers have percentage", () => {
    const answers = [
      createTestAnswer(1, 1, 1, true, 50),
      createTestAnswer(2, 1, 2, false, 30),
    ];
    const result = getAnswerStatus(answers);
    expect(result).toBe(AnswerStatus.Viewed);
  });

  it("returns Viewed when multiple answers are selected", () => {
    const answers = [
      createTestAnswer(1, 1, 1, true, 50),
      createTestAnswer(2, 1, 2, true, null),
    ];
    const result = getAnswerStatus(answers);
    expect(result).toBe(AnswerStatus.Viewed);
  });

  it("returns Submitted when exactly one answer has percentage and one is selected", () => {
    const answers = [
      createTestAnswer(1, 1, 1, true, null),
      createTestAnswer(2, 1, 2, false, 50),
    ];
    const result = getAnswerStatus(answers);
    expect(result).toBe(AnswerStatus.Submitted);
  });
});
