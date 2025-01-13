### Restore Streak 1 Jan Affected User

```sql
-- Create temporary table for target users
CREATE TEMP TABLE target_users AS
WITH dec31_users AS (
    SELECT DISTINCT "userId"
    FROM (
      SELECT "userId" FROM "ChompResult" WHERE DATE("createdAt") = '2024-12-31'
      UNION
      SELECT "userId" FROM "QuestionAnswer" 
      WHERE DATE("createdAt") = '2024-12-31' AND "status" = 'Submitted'
    ) a
),
jan1_users AS (
    SELECT DISTINCT "userId"
    FROM (
      SELECT "userId" FROM "ChompResult" WHERE DATE("createdAt") = '2025-01-01'
      UNION
      SELECT "userId" FROM "QuestionAnswer" 
      WHERE DATE("createdAt") = '2025-01-01' AND "status" = 'Submitted'
    ) b
),
jan2_users AS (
    SELECT DISTINCT "userId"
    FROM (
      SELECT "userId" FROM "ChompResult" WHERE DATE("createdAt") = '2025-01-02'
      UNION
      SELECT "userId" FROM "QuestionAnswer" 
      WHERE DATE("createdAt") = '2025-01-02' AND "status" = 'Submitted'
    ) c
)
SELECT 
    u.id as "userId",
    random() < 0.5 as first_option_selected
FROM "User" u
JOIN dec31_users d31 ON u.id = d31."userId"
JOIN jan2_users j2 ON u.id = j2."userId"
LEFT JOIN jan1_users j1 ON u.id = j1."userId"
WHERE j1."userId" IS NULL
ORDER BY u.username

-- Insert QuestionAnswers
INSERT INTO "QuestionAnswer" ("questionOptionId", "userId", "percentage", "status", "selected", "timeToAnswer", "createdAt", "updatedAt")
SELECT 
    6610,
    tu."userId",
    50,
    'Submitted'::text::public."AnswerStatus",
    tu.first_option_selected,
    6000,
    TIMESTAMP '2024-01-01 12:00:00.000',
    TIMESTAMP '2024-01-01 12:00:00.000'
FROM target_users tu
UNION ALL
SELECT 
    6611,
    tu."userId",
    50,
    'Submitted'::text::public."AnswerStatus",
    NOT tu.first_option_selected,
    6000,
    TIMESTAMP '2024-01-01 12:00:00.000',
    TIMESTAMP '2024-01-01 12:00:00.000'
FROM target_users tu;

-- Insert ChompResults
INSERT INTO "ChompResult" ("userId", "questionId", "result", "transactionStatus", "rewardTokenAmount", "burnTransactionSignature", "createdAt", "updatedAt")
SELECT 
    tu."userId",
    2859,
    'Revealed'::text::public."ResultType",
    'Completed'::text::public."TransactionStatus",
    0,
    'STREAK_RECOVERY_NOT_REAL_TX_01_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    TIMESTAMP '2024-01-01 12:00:00.000',
    TIMESTAMP '2024-01-01 12:00:00.000'
FROM target_users tu;

-- Verify the inserted records
SELECT 'QuestionAnswer' as type, * FROM "QuestionAnswer" 
WHERE "createdAt" = TIMESTAMP '2024-01-01 12:00:00.000'
ORDER BY "userId", "questionOptionId";

SELECT 'ChompResult' as type, * FROM "ChompResult" 
WHERE "createdAt" = TIMESTAMP '2024-01-01 12:00:00.000'
ORDER BY "userId";

-- Clean up
DROP TABLE target_users;
```