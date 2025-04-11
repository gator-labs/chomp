"use client";

import { QuestionUnansweredIcon } from "@/app/components/Icons/QuestionUnansweredIcon";
import { cn } from "@/lib/utils";
import { QuestionOption } from "@prisma/client";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React from "react";

import PieChart from "../PieChart/PieChart";
import AquaCheckIcon from "../icons/AquaCheckIcon";
import RedXIcon from "../icons/RedXIcon";

type BinaryPieChartProps = {
  questionOptions: QuestionOption[];
  bestOption: string;
  optionSelected?: string | null;
  totalAnswers: number;
  correctAnswers: number;
};

ChartJS.register(ArcElement, Tooltip, Legend);

function BinaryPieChart({
  bestOption,
  optionSelected,
  questionOptions,
  totalAnswers,
  correctAnswers,
}: BinaryPieChartProps) {
  const isUserAnswerCorrect = bestOption === optionSelected;
  const BestAnswerPercentage = ((correctAnswers / totalAnswers) * 100).toFixed(
    2,
  );
  const incorrectPercentage = (
    ((totalAnswers - correctAnswers) / totalAnswers) *
    100
  ).toFixed(2);

  const data = {
    labels: ["(Best Answer)", ""],
    datasets: [
      {
        data: [Number(BestAnswerPercentage), Number(incorrectPercentage)],
        backgroundColor: ["#1ED3B3", "#ED6A5A"], // Colors for correct and incorrect
        hoverBackgroundColor: ["#1ED3B3", "#ED6A5A"],
        borderColor: ["white"],
        borderAlign: "inner",
        hoverOffset: 20,
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="bg-gray-700 rounded-xl my-3">
      <div className="flex justify-between items-center bg-chomp-aqua-light rounded-t-xl p-2">
        <p>First Order Answer</p>
        {optionSelected === null ? (
          <div className="rounded-full">
            <QuestionUnansweredIcon width={24} height={24} />{" "}
          </div>
        ) : isUserAnswerCorrect ? (
          <AquaCheckIcon width={24} height={24} />
        ) : (
          <RedXIcon width={24} height={24} />
        )}
      </div>

      <div className="p-5 flex flex-col justify-between items-center">
        <p className="text-sm">
          {!isUserAnswerCorrect ? (
            <span className="text-destructive">
              You are not a part of the {correctAnswers} of {totalAnswers}{" "}
            </span>
          ) : (
            <span className="text-chomp-green-tiffany">
              You are part of the {correctAnswers} of {totalAnswers}{" "}
            </span>
          )}
          users who chose the best answer ({BestAnswerPercentage}%)
        </p>
        <PieChart data={data} />
        {questionOptions.map((qo, index) => (
          <div
            className={cn(
              "flex items-center justify-center w-full py-3 text-sm font-semibold text-white rounded-lg my-2",
              index === 1 ? "bg-destructive" : "bg-chomp-green-tiffany", // Apply red background for the second option
            )}
            key={qo.id}
          >
            <div>{qo?.option}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BinaryPieChart;
