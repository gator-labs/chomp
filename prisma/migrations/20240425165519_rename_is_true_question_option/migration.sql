ALTER TABLE
  "QuestionOption"
ADD
  COLUMN "isCorrect" BOOLEAN NOT NULL DEFAULT false;

UPDATE
  "QuestionOption"
SET
  "isCorrect" = "isTrue";

ALTER TABLE
  "QuestionOption" DROP COLUMN "isTrue";