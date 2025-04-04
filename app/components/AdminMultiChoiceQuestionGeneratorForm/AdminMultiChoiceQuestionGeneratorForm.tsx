"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useRef, useState } from "react";

type AdminMultiChoiceQuestionGeneratorFormProps = {
  action: (
    correctOption: string,
    tag: string,
    creditCostPerQuestion: number | null,
    questionCount: number,
  ) => Promise<{
    deckLink: string;
  }>;
};

export default function AdminMultiChoiceQuestionGeneratorForm({
  action,
}: AdminMultiChoiceQuestionGeneratorFormProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deckLink, setDeckLink] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const currentDate = new Date();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    setIsLoading(true);

    const tag = formData.get("tag") as string | null;
    const creditCost = formData.get("creditCost") as string;
    const correctOption = formData.get("correctOption") as string | null;
    const questionCount = Number(formData.get("questionCount"));

    const creditCostPerQuestion =
      creditCost === "none" ? null : Number(creditCost);

    if (!tag || !correctOption) {
      setMessage("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      const { deckLink } = await action(
        correctOption,
        tag,
        creditCostPerQuestion,
        questionCount,
      );

      setDeckLink(deckLink);
      setMessage(
        "Deck has been successfully created. Click here to view the deck.",
      );

      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error) {
      console.error(error);
      setMessage("Error occurred while creating the question.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6 bg-black text-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Create MultiChoice Objective Question
      </h1>

      <form onSubmit={handleFormSubmit} ref={formRef} className="space-y-6">
        <div>
          <label
            htmlFor="creditCost"
            className="block text-sm font-medium text-gray-300"
          >
            Credit Cost Per Question
          </label>
          <select
            id="creditCost"
            name="creditCost"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="0">0 (free)</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="tag"
            className="block text-sm font-medium text-gray-300"
          >
            Tag Name: {format(currentDate, "MM/dd/yyyy")}
          </label>
          <input
            id="tag"
            name="tag"
            type="text"
            required
            placeholder={`Tag Name: ${format(currentDate, "MM/dd/yyyy")}`}
            className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="correctOption"
            className="block text-sm font-medium text-gray-300"
          >
            Correct Option:
          </label>
          <select
            id="correctOption"
            name="correctOption"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="questionCount"
            className="block text-sm font-medium text-gray-300"
          >
            Number of Questions:
          </label>
          <select
            id="questionCount"
            name="questionCount"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {isLoading ? "Processing..." : "Create Question"}
          </button>
        </div>
      </form>

      <div className="mt-2.5">
        {message && (
          <Link
            className="mt-4 text-center text-lg font-medium hover:bg-indigo-700"
            href={deckLink ?? "#"}
          >
            {message}
          </Link>
        )}
      </div>
    </div>
  );
}
