
```sql
-- Insert a Deck and return its ID
WITH inserted_deck AS (
  INSERT INTO "Deck" ("deck", "date")
  VALUES ('Sample Deck', NOW() + (random() * 4) * INTERVAL '1 hour')
  RETURNING id
), inserted_questions AS (
  -- Insert Questions and return their IDs
  INSERT INTO "Question" ("question", "type", "revealToken", "revealTokenAmount")
  VALUES 
    ('Is the sky blue?', 'TrueFalse', 'Bonk', 0),
    ('Do fish fly?', 'TrueFalse', 'Bonk', 0),
    ('Is water wet?', 'TrueFalse', 'Bonk', 0),
    ('Can dogs speak English?', 'TrueFalse', 'Bonk', 0)
  RETURNING id AS question_id
), inserted_options AS (
  -- For each inserted question, insert two options
  INSERT INTO "QuestionOption" ("option", "isTrue", "questionId")
  SELECT opt.option, opt.isTrue, iq.question_id
  FROM inserted_questions iq
  CROSS JOIN LATERAL (VALUES 
    ('True', TRUE), 
    ('False', FALSE)
  ) AS opt(option, isTrue)
), cross_join AS (
  -- Cross join to prepare rows for the DeckQuestion table
  SELECT d.id AS deck_id, q.question_id
  FROM inserted_deck d, inserted_questions q
)
-- Insert relationships into DeckQuestion
INSERT INTO "DeckQuestion" ("deckId", "questionId")
SELECT deck_id, question_id FROM cross_join;
```