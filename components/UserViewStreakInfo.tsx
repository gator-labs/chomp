"use client";

import { useGetUserStreakQuery } from "@/hooks/useGetUserStreakQuery";
import { useState } from "react";
import React from "react";

export function UserViewStreakInfo() {
  const [wallet, setWallet] = useState<string>("");
  const streak = useGetUserStreakQuery(wallet);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-black text-white overflow-hidden">
      <h1 className="text-4xl font-semibold text-center mb-8">
        Look up User Streak
      </h1>
      <div>
        <label
          htmlFor="wallet"
          className="block text-sm font-medium text-gray-300"
        >
          User Wallet:
        </label>
        <input
          id="wallet"
          type="text"
          required
          placeholder="User wallet"
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />
      </div>
      {streak.isSuccess && !streak.isFetching && (
        <div className="flex justify-center p-4 border-2 font-bold">
          {streak.data.streak === null && <div>No streak</div>}
          {streak.data.streak !== null && (
            <div>Streak of {streak.data.streak.streakLength} days</div>
          )}
        </div>
      )}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={!wallet || streak.isFetching}
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          onClick={() => streak.refetch()}
        >
          {streak.isFetching ? "Loading..." : "Look up User Streak"}
        </button>
      </div>
    </div>
  );
}
