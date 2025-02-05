"use client";

import { addCredits } from "@/app/actions/user";
import { useToast } from "@/app/providers/ToastProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

function Users() {
  const { successToast, errorToast } = useToast();

  const userSchema = z.object({
    wallet: z.string().refine((val) => {
      const addresses = val
        .split(",")
        .map((address) => address.trim())
        .filter(Boolean);
      return (
        addresses.length > 0 &&
        addresses.every((address) => address.length >= 32)
      );
    }, "Please provide valid wallet addresses separated by commas"),

    credits: z.number(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: zodResolver(userSchema) });

  const onSubmit = handleSubmit(async (data) => {
    const wallets = data.wallet
      .split(",")
      .map((address: string) => address.trim())
      .filter(Boolean)
      .filter(
        (address: string, index: number, self: string[]) =>
          self.indexOf(address) === index,
      );

    // If user doesn't confirm, return
    if (
      !window.confirm(
        `Give ${wallets.length} user${wallets.length > 1 ? "s" : ""} ${data.credits} credits each?`,
      )
    ) {
      return;
    }
    try {
      await addCredits({ wallets, credits: data.credits });
      reset();
      successToast(`Gave ${wallets.length} users ${data.credits} credits`);
    } catch (e) {
      errorToast(e instanceof Error ? e.message : "An error occurred");
    }
  });

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-black text-white overflow-hidden">
      <h1 className="text-4xl font-semibold text-center mb-8">Add Credits</h1>
      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <label
            htmlFor="wallet"
            className="block text-sm font-medium text-gray-300"
          >
            User Wallet Addresses (comma separated):
          </label>
          <input
            id="wallet"
            type="text"
            required
            placeholder="9Jsr...8u85, BsK5...rn6p, Fc0k...2uiQ"
            className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
            {...register("wallet")}
          />
          <div className="text-destructive">
            {typeof errors.wallet?.message === "string" &&
              errors.wallet?.message}
          </div>
        </div>
        <div>
          <label
            htmlFor="credits"
            className="block text-sm font-medium text-gray-300"
          >
            Num of Credits:
          </label>
          <input
            id="credits"
            type="number"
            required
            placeholder="5"
            className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
            {...register("credits", { valueAsNumber: true })}
          />
          <div className="text-destructive">
            {typeof errors.credits?.message === "string" &&
              errors.credits?.message}
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {isSubmitting ? "Processing..." : "Add Credits"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Users;
