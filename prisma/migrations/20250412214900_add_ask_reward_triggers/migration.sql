-- Gives the asker of a community "ask" question a credit when
-- another user answers a question.
CREATE OR REPLACE FUNCTION reward_answered_community_ask_question_asker()
RETURNS TRIGGER AS $$
DECLARE
    "REWARD_FOR_ANSWERED_QUESTION" CONSTANT DECIMAL = 1;
    "v_questionId" INT;
    "v_questionAsker" TEXT;
    "v_isSubmittedByUser" BOOLEAN;
    "v_aqaId" INT;
BEGIN
    SELECT
        "questionId" INTO "v_questionId"
    FROM
        "QuestionOption"
    WHERE "id" = NEW."questionOptionId";

    SELECT
        "isSubmittedByUser", "createdByUserId" INTO "v_isSubmittedByUser", "v_questionAsker"
    FROM
        "Question"
    WHERE "id" = "v_questionId";

    -- Check if this is a user submitted question and then check
    -- if we've already rewarded this question by looking for an
    -- entry in the "AskQuestionAnswer" table.
    --
    -- We also require a first-order and second order response in
    -- order to be eligible for a reward.
    IF "v_isSubmittedByUser" IS TRUE AND "v_questionAsker" IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM "AskQuestionAnswer"
        WHERE "userId" = NEW."userId"
        AND "questionId" = "v_questionId"
    ) AND (
        -- We need to check that:
        -- a) A first-order option was selected:
        --    possibly this one, possibly already
        --    inserted.
        -- b) A second-order percentage was given:
        --    again, could be another option, and
        --    possibly the options with the 1st/2nd
        --    order are different.
        (NEW."percentage" IS NOT NULL OR EXISTS (
          SELECT 1
          FROM "QuestionAnswer" qa
          LEFT JOIN "QuestionOption" qo
          ON qa."questionOptionId" = qo."id"
          WHERE qo."questionId" = "v_questionId"
          AND "percentage" IS NOT NULL
          AND "userId" = NEW."userId"
        )) AND (
          NEW."selected" IS TRUE OR EXISTS (
          SELECT 1
          FROM "QuestionAnswer" qa
          LEFT JOIN "QuestionOption" qo
          ON qa."questionOptionId" = qo."id"
          WHERE qo."questionId" = "v_questionId"
          AND "selected" IS TRUE
          AND "userId" = NEW."userId"
        ))
    ) THEN
        INSERT INTO "AskQuestionAnswer" (
            "userId",
            "questionId"
        ) VALUES (
            NEW."userId",
            "v_questionId"
        ) RETURNING "id" INTO "v_aqaId";

        INSERT INTO "FungibleAssetTransactionLog" (
            "userId",
            "askQuestionAnswerId",
            "type",
            "asset",
            "change"
        ) VALUES (
            "v_questionAsker",
            "v_aqaId",
            'AskQuestionAnswered',
            'Credit',
            "REWARD_FOR_ANSWERED_QUESTION"
        );
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for the above

CREATE OR REPLACE TRIGGER trigger_reward_answered_community_ask_question_asker
AFTER INSERT OR UPDATE ON "QuestionAnswer"
FOR EACH ROW
EXECUTE FUNCTION reward_answered_community_ask_question_asker();

-------------------------------------------------------------------------------

-- Gives the asker of a community "ask" question credits when
-- their answer is accepted, which we detect by its addition
-- into a parent deck in the community ask stack.
CREATE OR REPLACE FUNCTION reward_accepted_community_ask_question_asker()
RETURNS TRIGGER AS $$
DECLARE
    "REWARD_FOR_ACCEPTED_QUESTION" CONSTANT DECIMAL = 69;
    "v_questionId" INT;
    "v_stackId" INT;
    "v_questionAsker" TEXT;
    "v_isSubmittedByUser" BOOLEAN;
BEGIN
    SELECT
        "isSubmittedByUser", "createdByUserId"
    INTO
        "v_isSubmittedByUser", "v_questionAsker"
    FROM
        "Question"
    WHERE
        "id" = NEW."questionId";

    SELECT
      "stackId"
    INTO
      "v_stackId"
    FROM
      "Deck"
    WHERE
      "id" = NEW."deckId";

    -- Check if this is a user submitted question, being added to
    -- a deck in the community stack, and then check if we've
    -- already rewarded this question by looking for an existing
    -- entry in the FATL table.
    IF "v_isSubmittedByUser" IS TRUE AND "v_questionAsker" IS NOT NULL AND EXISTS (
        SELECT 1
        FROM "Stack"
        WHERE "specialId" = 'CommunityAsk'
        AND "id" = "v_stackId"
    ) AND NOT EXISTS (
        SELECT 1
        FROM "FungibleAssetTransactionLog"
        WHERE "userId" = "v_questionAsker"
        AND "type" = 'AskQuestionAccepted'
        AND "questionId" = NEW."questionId"
    ) THEN
        INSERT INTO "FungibleAssetTransactionLog" ("userId", "type", "asset", "change")
        VALUES ("v_questionAsker", 'AskQuestionAccepted', 'Credit', "REWARD_FOR_ACCEPTED_QUESTION");
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for the above

CREATE OR REPLACE TRIGGER trigger_reward_accepted_community_ask_question_asker
AFTER INSERT ON "DeckQuestion"
FOR EACH ROW
EXECUTE FUNCTION reward_accepted_community_ask_question_asker();
