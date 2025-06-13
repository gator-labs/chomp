import { AnswerStatus, QuestionAnswer } from "@prisma/client";
import getAnswerStatus from "@/lib/answers/getAnswerStatus";
import { InvalidAnswerError } from "@/lib/error";

describe("getAnswerStatus", () => {
  const userId = "user123";
  const questionOptionId = 1;

  it("returns Viewed for empty array", () => {
    const result = getAnswerStatus([]);
    expect(result).toBe(AnswerStatus.Viewed);
  });

  it("throws InvalidAnswerError if answers belong to different users", () => {
    const answers: QuestionAnswer[] = [
      {
        id: 1,
        userId: "user1",
        questionOptionId,
        selected: true,
        percentage: null,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId: "user2",
        questionOptionId,
        selected: false,
        percentage: 50,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    expect(() => getAnswerStatus(answers)).toThrow(InvalidAnswerError);
    expect(() => getAnswerStatus(answers)).toThrow(
      "All answers must belong to the same user and question"
    );
  });

  it("throws InvalidAnswerError if answers belong to different questions", () => {
    const answers: QuestionAnswer[] = [
      {
        id: 1,
        userId,
        questionOptionId: 1,
        selected: true,
        percentage: null,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId,
        questionOptionId: 2,
        selected: false,
        percentage: 50,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    expect(() => getAnswerStatus(answers)).toThrow(InvalidAnswerError);
    expect(() => getAnswerStatus(answers)).toThrow(
      "All answers must belong to the same user and question"
    );
  });

  it("returns Viewed when no answer has percentage", () => {
    const answers: QuestionAnswer[] = [
      {
        id: 1,
        userId,
        questionOptionId,
        selected: true,
        percentage: null,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId,
        questionOptionId,
        selected: false,
        percentage: null,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = getAnswerStatus(answers);
    expect(result).toBe(AnswerStatus.Viewed);
  });

  it("returns Viewed when no answer is selected", () => {
    const answers: QuestionAnswer[] = [
      {
        id: 1,
        userId,
        questionOptionId,
        selected: false,
        percentage: 50,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId,
        questionOptionId,
        selected: false,
        percentage: null,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = getAnswerStatus(answers);
    expect(result).toBe(AnswerStatus.Viewed);
  });

  it("returns Viewed when multiple answers have percentage", () => {
    const answers: QuestionAnswer[] = [
      {
        id: 1,
        userId,
        questionOptionId,
        selected: true,
        percentage: 50,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId,
        questionOptionId,
        selected: false,
        percentage: 30,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = getAnswerStatus(answers);
    expect(result).toBe(AnswerStatus.Viewed);
  });

  it("returns Viewed when multiple answers are selected", () => {
    const answers: QuestionAnswer[] = [
      {
        id: 1,
        userId,
        questionOptionId,
        selected: true,
        percentage: 50,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId,
        questionOptionId,
        selected: true,
        percentage: null,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = getAnswerStatus(answers);
    expect(result).toBe(AnswerStatus.Viewed);
  });

  it("returns Submitted when exactly one answer has percentage and one is selected", () => {
    const answers: QuestionAnswer[] = [
      {
        id: 1,
        userId,
        questionOptionId,
        selected: true,
        percentage: null,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId,
        questionOptionId,
        selected: false,
        percentage: 50,
        status: AnswerStatus.Viewed,
        isAssigned2ndOrderOption: false,
        timeToAnswer: null,
        score: null,
        weight: 1,
        uuid: "uuid2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = getAnswerStatus(answers);
    expect(result).toBe(AnswerStatus.Submitted);
  });
});
