"use client";

import { OPTION_LABEL } from "@/app/components/AnswerResult/constants";
import { cn } from "@/lib/utils";
import { QuestionOption } from "@prisma/client";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React from "react";

import PieChart from "../PieChart/PieChart";
import AquaCheckIcon from "../icons/AquaCheckIcon";
import RedXIcon from "../icons/RedXIcon";

type MultiChoicePieChartProps = {
  questionOptions: QuestionOption[];
  bestOption: string;
  optionSelected?: string | null;
  totalAnswers: number;
  correctAnswers: number;
};

ChartJS.register(ArcElement, Tooltip, Legend);

function MultiChoicePieChart({
  bestOption,
  optionSelected,
  questionOptions,
  totalAnswers,
  correctAnswers,
}: MultiChoicePieChartProps) {
  const isUserAnswerCorrect = bestOption === optionSelected;
  const BestAnswerPercentage = ((correctAnswers / totalAnswers) * 100).toFixed(
    2,
  );
  const incorrectPercentage = (
    ((totalAnswers - correctAnswers) / totalAnswers) *
    100
  ).toFixed(2);

  const colors = ["#ECEAFF", "#CCCAFF", "#9B98FF", "#706CFF"];
  const boxShadow = ["#BFBDFF", "#7D79EA", "#6965F0", "#4741FC"];

  const data = {
    labels: ["(Best Answer)", ""],
    datasets: [
      {
        data: [`${BestAnswerPercentage}`, incorrectPercentage],
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
        <p>First Order Answer</p>
        {optionSelected === null ? (
          <></>
        ) : isUserAnswerCorrect ? (
          <AquaCheckIcon width={24} height={24} />
        ) : (
          <RedXIcon width={24} height={24} />
        )}
      </div>

      <div className="p-5 flex flex-col justify-between">
        <p className="text-sm">
          {optionSelected === null ? (
            <span className="text-white">
              <b>{correctAnswers}</b> of <b>{totalAnswers}</b> users chose the
              best answer ({BestAnswerPercentage}%)
            </span>
          ) : !isUserAnswerCorrect ? (
            <span className="text-destructive">
              You are not a part of the <b>{correctAnswers}</b> of{" "}
              <b>{totalAnswers}</b>{" "}
              <span className="text-white">
                users who chose the best answer ({BestAnswerPercentage}%)
              </span>
            </span>
          ) : (
            <span className="text-chomp-green-tiffany">
              You are part of the <b>{correctAnswers}</b> of{" "}
              <b>{totalAnswers}</b>{" "}
              <span className="text-white">
                users who chose the best answer ({BestAnswerPercentage}%)
              </span>
            </span>
          )}
        </p>
        <div className="m-auto">
          <PieChart data={data} />
        </div>
        <div className="w-full">
          {questionOptions.map((qo, index) => (
            <div key={qo.id} className="flex flex-row gap-1 items-center my-2">
              <div
                className={cn(
                  `w-[50px] h-[50px] bg-gray-600 rounded-lg flex items-center justify-center`,
                )}
                style={{
                  backgroundColor: colors[index],
                  boxShadow: `0px 3px 0px 0px ${boxShadow[index]}, 0px 4px 4px 0px rgba(0, 0, 0, 0.25)`,
                }}
              >
                <p
                  className={cn("text-sm font-bold text-white", {
                    "!text-gray-800": qo.option === bestOption,
                  })}
                >
                  {OPTION_LABEL[index as keyof typeof OPTION_LABEL]}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-[50px] bg-transparent  gap-2  px-2 w-full py-3 text-sm font-semibold text-white rounded-lg border-solid border-gray-500 border",
                )}
              >
                <div>{qo?.option}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MultiChoicePieChart;
