"use client";

import { OPTION_LABEL } from "@/app/components/AnswerResult/constants";
import { cn } from "@/lib/utils";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React from "react";

import PieChart from "../PieChart/PieChart";
import AquaCheckIcon from "../icons/AquaCheckIcon";
import RedXIcon from "../icons/RedXIcon";

type MultiChoicePieChartProps = {
  bestOption: string;
  optionSelected?: string | null;
  totalAnswers: number;
  correctAnswers: number;
  selectionDistribution: {
    option: string;
    count: number;
  }[];
};

ChartJS.register(ArcElement, Tooltip, Legend);

const colors = ["#ECEAFF", "#CCCAFF", "#9B98FF", "#706CFF"];
const boxShadows = ["#BFBDFF", "#7D79EA", "#6965F0", "#4741FC"];
const bgColors = [
  "bg-[#ECEAFF]",
  "bg-[#CCCAFF]",
  "bg-[#9B98FF]",
  "bg-[#706CFF]",
];
const hoverColors = [
  "hover:bg-[#D1CFE8]",
  "hover:bg-[#AFACEF]",
  "hover:bg-[#7E7BD7]",
  "hover:bg-[#5550DE]",
];

function getBoxShadow(index: number) {
  return `0px 3px 0px 0px ${boxShadows[index]}, 0px 4px 4px 0px rgba(0, 0, 0, 0.25)`;
}

function getBarWidth(count: number, total: number) {
  return `calc(${((count / total) * 100).toFixed(1)}% + 5px)`;
}

function MultiChoicePieChart({
  bestOption,
  optionSelected,
  totalAnswers,
  correctAnswers,
  selectionDistribution,
}: MultiChoicePieChartProps) {
  const isUserAnswerCorrect = bestOption === optionSelected;

  const bestOptionData = selectionDistribution.find(
    (sd) => sd.option === bestOption,
  );
  const bestAnswerPercentage = bestOptionData
    ? ((bestOptionData.count / totalAnswers) * 100).toFixed(1)
    : "0.0";

  const data = {
    labels: selectionDistribution.map((sd) =>
      sd.option === bestOption ? `${sd.option} (Best Answer)` : sd.option,
    ),
    datasets: [
      {
        data: selectionDistribution.map((sd) => sd.count),
        backgroundColor: colors,
        hoverBackgroundColor: colors,
        borderColor: ["white"],
        borderAlign: "inner",
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
        <p className="pl-2 font-bold">First Order Answer</p>
        {optionSelected === null ? null : isUserAnswerCorrect ? (
          <AquaCheckIcon width={32} height={32} />
        ) : (
          <RedXIcon width={32} height={32} />
        )}
      </div>

      <div className="p-5 flex flex-col justify-between">
        <p className="text-sm">
          {correctAnswers === 0 ? (
            <span>No user chose the best answer</span>
          ) : optionSelected === null ? (
            <span className="text-white">
              <b>{correctAnswers}</b> of <b>{totalAnswers}</b> users chose the
              best answer ({bestAnswerPercentage}%)
            </span>
          ) : !isUserAnswerCorrect ? (
            <span className="text-destructive">
              You are not a part of the <b>{correctAnswers}</b> of{" "}
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
        <div className="w-full">
          {selectionDistribution.map((qo, index) => (
            <div key={index} className="flex flex-row gap-1 items-center my-2">
              <div
                style={{
                  boxShadow: getBoxShadow(index),
                }}
                className={cn(
                  "w-[50px] h-[50px] rounded-lg flex items-center justify-center cursor-pointer",
                  bgColors[index],
                  hoverColors[index],
                )}
              >
                <p
                  className={cn("text-sm font-bold text-white", {
                    "text-gray-900": index === 0 || index === 1,
                  })}
                >
                  {OPTION_LABEL[index as keyof typeof OPTION_LABEL]}
                </p>
              </div>
              <div
                className={cn(
                  "border-gray-500 border-solid border rounded-lg flex h-[50px] bg-transparent gap-2 w-full items-center justify-between relative overflow-hidden",
                )}
              >
                <p className="z-10 text-sm font-medium px-3">{qo?.option}</p>
                <div
                  className="bg-gray-600 h-full absolute"
                  style={{
                    width: getBarWidth(qo.count, totalAnswers),
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MultiChoicePieChart;
