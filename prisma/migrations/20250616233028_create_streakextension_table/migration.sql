-- CreateTable
CREATE TABLE "StreakExtension" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "activityDate" DATE NOT NULL,
    "streakValue" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "StreakExtension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StreakExtension_userId_activityDate_key" ON "StreakExtension"("userId", "activityDate");

-- AddForeignKey
ALTER TABLE "StreakExtension" ADD CONSTRAINT "StreakExtension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
