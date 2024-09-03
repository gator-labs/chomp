
```sql
WITH inserted_deck AS (
  INSERT INTO "Deck" ("deck", "date", "revealAtDate")
  VALUES ('Sample Deck', NOW() + (random() * 4) * INTERVAL '1 hour', NOW() + INTERVAL '1 days')
  RETURNING id
), inserted_questions AS (
  -- Insert Questions and return their IDs
  INSERT INTO "Question" ("question", "type", "revealToken", "revealTokenAmount", "revealAtDate", "durationMiliseconds")
  VALUES 
    ('Is the sky blue?', 'BinaryQuestion', 'Bonk', 0, NOW() + INTERVAL '1 days', 60000),
    ('Do fish fly?', 'BinaryQuestion', 'Bonk', 0, NOW() + INTERVAL '1 days', 60000),
    ('Is water wet?', 'BinaryQuestion', 'Bonk', 0, NOW() + INTERVAL '1 days', 60000),
    ('Can dogs speak English?', 'BinaryQuestion', 'Bonk', 0, NOW() + INTERVAL '1 days', 60000)
  RETURNING id AS question_id
), inserted_options AS (
  -- For each inserted question, insert two options
  INSERT INTO "QuestionOption" ("option", "isCorrect", "isLeft", "questionId")
  SELECT opt.option, opt.isCorrect, opt.isLeft, iq.question_id
  FROM inserted_questions iq
  CROSS JOIN LATERAL (VALUES 
    ('True', true, true), 
    ('False', false, false)
  ) AS opt(option, isCorrect, isLeft)
), cross_join AS (
  -- Cross join to prepare rows for the DeckQuestion table
  SELECT d.id AS deck_id, q.question_id
  FROM inserted_deck d, inserted_questions q
)
-- Insert relationships into DeckQuestion
INSERT INTO "DeckQuestion" ("deckId", "questionId")
SELECT deck_id, question_id FROM cross_join;
```