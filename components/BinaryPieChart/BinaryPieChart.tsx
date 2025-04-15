"use client";

import { cn } from "@/lib/utils";
import { QuestionOption } from "@prisma/client";
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

const chartColors = ["#1ED3B3", "#ED6A5A"];

function BinaryPieChart({
  bestOption,
  optionSelected,
  questionOptions,
  totalAnswers,
  correctAnswers,
}: BinaryPieChartProps) {
  const isUserAnswerCorrect = bestOption === optionSelected;
  const bestAnswerPercentage = ((correctAnswers / totalAnswers) * 100).toFixed(
    1,
  );

  const data = {
    labels: questionOptions.map((qo) =>
      qo.option === bestOption ? `${qo.option} (Best Answer)` : qo.option,
    ),
    datasets: [
      {
        data: questionOptions.map((qo) =>
          qo.option === bestOption
            ? correctAnswers
            : totalAnswers - correctAnswers,
        ),
        backgroundColor: chartColors,
        hoverBackgroundColor: chartColors,
        borderColor: ["white"],
        hoverOffset: 20,
        borderWidth: 1,
        hoverBorderWidth: 0,
      },
    ],
  };

  return (
    <div className="bg-gray-700 rounded-xl my-3">
      <div
        className={cn(
          "flex justify-between items-center bg-chomp-red-dusty rounded-t-xl p-2 pl-4",
          {
            "bg-gray-600": optionSelected === null,
            "bg-chomp-aqua-light": isUserAnswerCorrect,
          },
        )}
      >
        <p>First Order Answer</p>
        {optionSelected !== null && (
          <>
            {isUserAnswerCorrect ? (
              <AquaCheckIcon width={24} height={24} />
            ) : (
              <RedXIcon width={24} height={24} />
            )}
          </>
        )}
      </div>

      <div className="p-5 flex flex-col justify-between">
        <p className="text-sm">
          {optionSelected === null ? (
            <span className="text-white">
              <b>{correctAnswers}</b> of <b>{totalAnswers}</b> users chose the
              best answer ({bestAnswerPercentage}%)
            </span>
          ) : !isUserAnswerCorrect ? (
            <span className="text-destructive">
              You are not part of the <b>{correctAnswers}</b> of{" "}
              <b>{totalAnswers}</b>{" "}
              <span className="text-white">
                users who chose the best answer ({bestAnswerPercentage}%)
              </span>
            </span>
          ) : (
            <span className="text-chomp-green-tiffany">
              You are part of the <b>{correctAnswers}</b> of{" "}
              <b>{totalAnswers}</b>{" "}
              <span className="text-white">
                users who chose the best answer ({bestAnswerPercentage}%)
              </span>
            </span>
          )}
        </p>

        <div className="m-auto">
          <PieChart data={data} />
        </div>

        {questionOptions.map((qo) => (
          <div
            key={qo.id}
            className={cn(
              "flex items-center justify-center w-full py-3 text-sm font-semibold text-white rounded-lg my-2",
              qo.option === bestOption
                ? "bg-chomp-green-tiffany"
                : "bg-destructive",
            )}
          >
            {qo.option}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BinaryPieChart;
