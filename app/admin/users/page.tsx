"use client";

import { UserGiveCredits } from "@/components/UserGiveCredits";
import { UserRepairStreak } from "@/components/UserRepairStreak";
import { UserViewStreakInfo } from "@/components/UserViewStreakInfo";

function Users() {
  return (
    <>
      <UserGiveCredits />
      <UserViewStreakInfo />
      <UserRepairStreak />
    </>
  );
}

export default Users;
