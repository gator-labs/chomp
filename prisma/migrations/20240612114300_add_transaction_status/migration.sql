-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('Pending', 'Completed');

-- AlterTable
ALTER TABLE "ChompResult" ADD COLUMN     "transactionStatus" "TransactionStatus" NOT NULL DEFAULT 'Completed';
