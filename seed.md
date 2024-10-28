## DB seed

Seed the DB with sample questions.

```sql
INSERT INTO "Question" ("question", "type", "revealToken", "revealTokenAmount")
VALUES ('Is Paris the capital of France?', 'BinaryQuestion', 'Bonk', 0);

-- Option 1: Yes (correct)
INSERT INTO "QuestionOption" ("option", "isCorrect", "questionId")
VALUES ('Yes', TRUE, 1);

-- Option 2: No (incorrect)
INSERT INTO "QuestionOption" ("option", "isCorrect", "questionId")
VALUES ('No', FALSE, 1);
```
