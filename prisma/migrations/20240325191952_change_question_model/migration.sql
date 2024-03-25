-- CreateEnum
CREATE TYPE "Token" AS ENUM ('Bonk');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "revealAtAnswerCount" INTEGER,
ADD COLUMN     "revealAtDate" TIMESTAMP(3),
ADD COLUMN     "revealToken" "Token" NOT NULL DEFAULT 'Bonk',
ADD COLUMN     "revealTokenAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "QuestionOption" ADD COLUMN     "isTrue" BOOLEAN NOT NULL DEFAULT false;
