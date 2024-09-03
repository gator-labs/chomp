-- CreateEnum
CREATE TYPE "ResultType" AS ENUM ('Revealed', 'Claimed', 'Dismissed');

-- CreateTable
CREATE TABLE "ChompResult" (
  "id" SERIAL NOT NULL,
  "userId" TEXT NOT NULL,
  "questionId" INTEGER,
  "deckId" INTEGER,
  "result" "ResultType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChompResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE
  "ChompResult"
ADD
  CONSTRAINT "ChompResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
  "ChompResult"
ADD
  CONSTRAINT "ChompResult_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE
SET
  NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
  "ChompResult"
ADD
  CONSTRAINT "ChompResult_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE
SET
  NULL ON UPDATE CASCADE;

insert into
  "ChompResult" (
    "userId",
    "questionId",
    "deckId",
    "result",
    "createdAt",
    "updatedAt"
  )
select
  "userId",
  "questionId",
  "deckId",
  'Revealed',
  "createdAt",
  "updatedAt"
from
  "Reveal"
where
  "isRewardClaimed" = false;

insert into
  "ChompResult" (
    "userId",
    "questionId",
    "deckId",
    "result",
    "createdAt",
    "updatedAt"
  )
select
  "userId",
  "questionId",
  "deckId",
  'Claimed',
  "createdAt",
  "updatedAt"
from
  "Reveal"
where
  "isRewardClaimed" = true;

-- DropForeignKey
ALTER TABLE
  "Reveal" DROP CONSTRAINT "Reveal_deckId_fkey";

-- DropForeignKey
ALTER TABLE
  "Reveal" DROP CONSTRAINT "Reveal_questionId_fkey";

-- DropForeignKey
ALTER TABLE
  "Reveal" DROP CONSTRAINT "Reveal_userId_fkey";

-- DropTable
DROP TABLE "Reveal";