"use client";

import { useToast } from "@/app/providers/ToastProvider";
import { useRepairUserStreak } from "@/hooks/useRepairUserStreak";
import { useEffect, useState } from "react";
import React from "react";
import DatePicker from "react-datepicker";

export function UserRepairStreak() {
  const { successToast, errorToast } = useToast();

  const [repairDate, setRepairDate] = useState<Date | null>(new Date());
  const [wallet, setWallet] = useState<string>("");
  const [reasonText, setReasonText] = useState<string>("");

  const streak = useRepairUserStreak();

  const isGlobalMode = wallet.trim() === "";

  useEffect(() => {
    if (streak.isError) errorToast("Failed to repair streak.");
  }, [streak.isError]);

  useEffect(() => {
    if (streak.isSuccess) {
      successToast("Successfully repaired streak");
    }
  }, [streak.isSuccess]);

  const handleRepairStreak = () => {
    if (repairDate === null) return;

    // Dates using local time, otherwise if we conver to UTC
    // the result is not what the user expected.

    const dateStr =
      repairDate.getFullYear() +
      "-" +
      (repairDate.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      repairDate.getDate().toString().padStart(2, "0");

    if (isGlobalMode) {
      streak.mutate({
        date: dateStr,
        reason: reasonText,
      });
    } else {
      streak.mutate({
        wallet,
        date: dateStr,
        reason: reasonText,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-black text-white overflow-hidden">
      <h1 className="text-4xl font-semibold text-center mb-8">
        Repair User Streak
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
          placeholder="(All Users)"
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
        />
      </div>
      <div>
        <label
          htmlFor="repairDate"
          className="block text-sm font-medium text-gray-300"
        >
          Repair Date:
        </label>
        <DatePicker
          showIcon
          selected={repairDate}
          onChange={(date) => setRepairDate(date)}
          placeholderText="Repair date"
          showTimeSelect={false}
          showTimeInput={false}
          dateFormat="yyyy-MM-dd"
          isClearable
        />
      </div>
      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-gray-300"
        >
          Reason for repair:
        </label>
        <input
          id="reason"
          type="text"
          placeholder=""
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          value={reasonText}
          onChange={(e) => setReasonText(e.target.value)}
        />
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={streak.isPending || repairDate === null}
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          onClick={handleRepairStreak}
        >
          {streak.isPending
            ? "Repairing..."
            : `Repair ${isGlobalMode ? "All Streaks" : "Streak for User"}`}
        </button>
      </div>
    </div>
  );
}
