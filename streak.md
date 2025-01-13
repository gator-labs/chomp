### Find the affected users

```sql
--- Step 1: Check Dec 31 activity
WITH dec31_users AS (
  SELECT DISTINCT "userId"
  FROM (
    SELECT "userId" FROM "ChompResult" WHERE DATE("createdAt") = '2024-12-31'
    UNION
    SELECT "userId" FROM "QuestionAnswer" 
    WHERE DATE("createdAt") = '2024-12-31' AND "status" = 'Submitted'
  ) a
),
-- Step 2: Check Jan 1 activity
jan1_users AS (
  SELECT DISTINCT "userId"
  FROM (
    SELECT "userId" FROM "ChompResult" WHERE DATE("createdAt") = '2025-01-01'
    UNION
    SELECT "userId" FROM "QuestionAnswer" 
    WHERE DATE("createdAt") = '2025-01-01' AND "status" = 'Submitted'
  ) b
),
-- Step 3: Check Jan 2 activity
jan2_users AS (
  SELECT DISTINCT "userId"
  FROM (
    SELECT "userId" FROM "ChompResult" WHERE DATE("createdAt") = '2025-01-02'
    UNION
    SELECT "userId" FROM "QuestionAnswer" 
    WHERE DATE("createdAt") = '2025-01-02' AND "status" = 'Submitted'
  ) c
)
-- Step 4: Find users who were active on 31st and 2nd
SELECT 
  u.id as "userId"
FROM "User" u
JOIN dec31_users d31 ON u.id = d31."userId"
JOIN jan2_users j2 ON u.id = j2."userId"
LEFT JOIN jan1_users j1 ON u.id = j1."userId"
WHERE j1."userId" IS NULL;
```

### Restore Streak of affected users

```sql
-- Insert QuestionAnswers
INSERT INTO "QuestionAnswer" ("questionOptionId", "userId", "percentage", "status", "selected", "timeToAnswer", "createdAt", "updatedAt")
SELECT 
  6610,
  "userId",
  50,
  'Submitted'::text::public."AnswerStatus",
  random() < 0.5,
  6000,
  TIMESTAMP '2024-01-01 12:00:00.000',
  TIMESTAMP '2024-01-01 12:00:00.000'
FROM (VALUES ('USER_1'), ('USER_2')) as t("userId")
UNION ALL
SELECT 
  6611,
  "userId",
  50,
  'Submitted'::text::public."AnswerStatus",
  random() < 0.5,
  6000,
  TIMESTAMP '2024-01-01 12:00:00.000',
  TIMESTAMP '2024-01-01 12:00:00.000'
FROM (VALUES ('USER_1'), ('USER_2')) as t("userId");

-- Insert ChompResults
INSERT INTO "ChompResult" ("userId", "questionId", "result", "transactionStatus", "rewardTokenAmount", "burnTransactionSignature", "createdAt", "updatedAt")
SELECT 
  "userId",
  2859,
  'Revealed'::text::public."ResultType",
  'Completed'::text::public."TransactionStatus",
  0,
  '5KtPn3MZJGkXGYx6K7BbNNa9Cy3eLSmop1SXfUJJQYPhzyqbYKhqp95GNzBqafEJQGwqWBk4Brh8Dv9PupZYPXPR',
  TIMESTAMP '2024-01-01 12:00:00.000',
  TIMESTAMP '2024-01-01 12:00:00.000'
FROM (VALUES ('USER_1'), ('USER_2')) as t("userId");

-- Verify the inserted records
SELECT 'QuestionAnswer' as type, * FROM "QuestionAnswer" 
WHERE "createdAt" = TIMESTAMP '2024-01-01 12:00:00.000'
ORDER BY "userId", "questionOptionId";

SELECT 'ChompResult' as type, * FROM "ChompResult" 
WHERE "createdAt" = TIMESTAMP '2024-01-01 12:00:00.000'
ORDER BY "userId";
```