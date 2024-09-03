create temp table "streaksEndedBecauseOfSkippedDate" as
select
  s."id",
  s."userId",
  s."streakStartedAt",
  s."lastDayOfStreak"
from
  public."Streak" s
where
  s."lastDayOfStreak" >= '2024-06-21 00:00:00' :: timestamp
  and s."lastDayOfStreak" < '2024-06-22 00:00:00' :: timestamp
  and exists (
    select
      1
    from
      public."Streak" subS
    where
      subS."streakStartedAt" >= '2024-06-24 00:00:00' :: timestamp
      and subS."streakStartedAt" < '2024-06-25 00:00:00' :: timestamp
      and s."userId" = subS."userId"
  );

create temp table "streaksStartedAtSkippedDate" as
select
  s."id",
  s."userId",
  s."streakStartedAt",
  s."lastDayOfStreak"
from
  public."Streak" s
where
  s."streakStartedAt" >= '2024-06-24 00:00:00' :: timestamp
  and s."streakStartedAt" < '2024-06-25 00:00:00' :: timestamp
  and s."userId" in (
    select
      skipped."userId"
    from
      "streaksEndedBecauseOfSkippedDate" skipped
  );

select
  *
from
  "streaksEndedBecauseOfSkippedDate";

select
  *
from
  "streaksStartedAtSkippedDate";

delete from
  public."Streak" s
where
  s."id" in (
    select
      startedStreaks."id"
    from
      "streaksStartedAtSkippedDate" startedStreaks
  );

update
  public."Streak" s
set
  "lastDayOfStreak" = e."lastDayOfStreak"
from
  "streaksEndedBecauseOfSkippedDate" e
where
  s."id" in (
    select
      ss."id"
    from
      "streaksStartedAtSkippedDate" ss
  )
  and s."id" = e."id";

ALTER TABLE
  "Streak"
ADD
  COLUMN "count" INTEGER NOT NULL DEFAULT 0,
ADD
  COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

update
  "Streak" s
set
  "count" = date_part('day', s."lastDayOfStreak" - s."streakStartedAt") + 1,
  "updatedAt" = "lastDayOfStreak";

ALTER TABLE
  "Streak" DROP COLUMN "lastDayOfStreak",
  DROP COLUMN "streakStartedAt";

drop table "streaksEndedBecauseOfSkippedDate";

drop table "streaksStartedAtSkippedDate";