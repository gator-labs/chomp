const queryRaw = `
  SELECT * FROM (
      SELECT
        q.id,
        q.question,
        q."revealAtDate",
        cr."rewardTokenAmount" as "claimedAmount",
        cr."burnTransactionSignature",
        c."image",
        q."revealTokenAmount",
        CASE
          WHEN COUNT(CASE WHEN qa.selected = true THEN 1 ELSE NULL END) > 0 THEN true
          ELSE false
        END AS "isAnswered",
        CASE
          WHEN COUNT(CASE WHEN cr.result = 'Claimed' AND cr."rewardTokenAmount" > 0 THEN 1 ELSE NULL END) > 0 THEN true
          ELSE false
        END AS "isClaimed",
        CASE
          WHEN COUNT(CASE WHEN (cr.result = 'Claimed' AND cr."rewardTokenAmount" > 0) OR (cr.result = 'Revealed' AND cr."transactionStatus" = 'Completed') THEN 1 ELSE NULL END) > 0 THEN true
          ELSE false
        END AS "isRevealed",
        CASE
          WHEN COUNT(CASE WHEN cr.result = 'Revealed' AND cr."rewardTokenAmount" > 0 THEN 1 ELSE NULL END) > 0
              AND COUNT(CASE WHEN cr.result = 'Claimed' AND cr."rewardTokenAmount" > 0 THEN 1 ELSE NULL END) = 0 THEN true
          ELSE false
        END AS "isClaimable",
        CASE
          WHEN COUNT(CASE WHEN cr.result = 'Claimed' OR (cr.result = 'Revealed' AND cr."transactionStatus" = 'Completed') THEN 1 ELSE NULL END) = 0
              AND q."revealAtDate" < NOW() THEN true
          ELSE false
        END AS "isRevealable"
      FROM
        public."Question" q
      JOIN
        public."QuestionOption" qo ON qo."questionId" = q.id
      LEFT JOIN
        public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id AND qa."userId" = r{userId}
      LEFT JOIN
        public."ChompResult" cr ON cr."questionId" = q.id AND cr."userId" = r{userId} AND cr."questionId" IS NOT NULL
      FULL JOIN public."Stack" c on c.id = q."stackId"
      JOIN public."DeckQuestion" dq ON dq."questionId" = q.id
      WHERE
        q."revealAtDate" IS NOT NULL AND (r{getAllDecks} IS TRUE OR dq."deckId" = r{deckId})
      GROUP BY
        q.id, cr."rewardTokenAmount", cr."burnTransactionSignature", c."image"
      HAVING
        (
          SELECT COUNT(distinct concat(qa."userId", qo."questionId"))
          FROM public."QuestionOption" qo
          JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
          WHERE qo."questionId" = q."id"
        ) >= r{Number(process.env.MINIMAL_ANSWERS_PER_QUESTION ?? 3)}
      ORDER BY q."revealAtDate" DESC, q."id"
  ) WHERE (
      r{filter} = 'all' OR (r{filter} = 'isRevealable' AND "isRevealable" IS true)
  )
  LIMIT r{pageSize} OFFSET r{offset}
`;

function getLineAtPosition(text, position) {
  // Split the text into lines
  const lines = text.split("\n");

  // Initialize a variable to keep track of the current position
  let currentPosition = 0;

  // Iterate through each line
  for (let i = 0; i < lines.length; i++) {
    // Calculate the length of the current line including the newline character
    const lineLength = lines[i].length + 1; // +1 for the newline character

    // Check if the position is within the current line
    if (currentPosition + lineLength > position) {
      return {
        line: lines[i],
        lineNumber: i + 1, // Line numbers are 1-based
      };
    }

    // Update the current position
    currentPosition += lineLength;
  }

  // If the position is beyond the end of the text, return null or an appropriate value
  return null;
}

console.log(queryRaw.length);

console.log(getLineAtPosition(queryRaw, 1921));
