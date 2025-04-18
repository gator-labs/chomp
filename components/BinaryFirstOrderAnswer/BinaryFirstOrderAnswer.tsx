"use client";

import { cn } from "@/lib/utils";
import { BinaryFirstOrderAnswerProps } from "@/types/answerPage";
import React from "react";

import FirstOrderAnswerWrapper from "../FirstOrderAnswerWrapper/FirstOrderAnswerWrapper";
import PieChart from "../PieChart/PieChart";

const chartColors = ["#1ED3B3", "#ED6A5A"];

function BinaryFirstOrderAnswerChart({
  bestOption,
  optionSelected,
  questionOptions,
  totalAnswers,
  correctAnswers,
}: BinaryFirstOrderAnswerProps) {
  const isBestSelected = bestOption === optionSelected;
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
    <FirstOrderAnswerWrapper
      isUnanswered={optionSelected === null}
      isBestSelected={isBestSelected}
    >
      <div className="p-5 flex flex-col justify-between">
        <p className="text-sm">
          {correctAnswers === 0 ? (
            <span>No user chose the best answer</span>
          ) : optionSelected === null ? (
            <span className="text-white">
              <b>{correctAnswers}</b> of <b>{totalAnswers}</b> users chose the
              best answer ({bestAnswerPercentage}%)
            </span>
          ) : !isBestSelected ? (
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

        <PieChart data={data} />

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
    </FirstOrderAnswerWrapper>
  );
}

export default BinaryFirstOrderAnswerChart;
