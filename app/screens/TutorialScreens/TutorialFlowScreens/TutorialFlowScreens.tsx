"use client";

import { User } from "@prisma/client";
import { useState } from "react";
import BinaryQuestionScreen from "../BinaryQuestionScreen/BinaryQuestionScreen";
import MultipleChoiceScreen from "../MultipleChoiceScreen/MultipleChoiceScreen";
import RevealScreen from "../RevealScreen/RevealScreen";

interface Props {
  currentUser: User;
}

const TutorialFlowScreens = ({ currentUser }: Props) => {
  const [currentMultiOptionSelected, setCurrentMultiOptionSelected] =
    useState<number>();

  const [activeScreen, setActiveScreen] = useState<
    "binary-question" | "multiple-choice" | "reveal" | null
  >("binary-question");

  if (!activeScreen) return null;

  if (activeScreen === "binary-question")
    return <BinaryQuestionScreen setActiveScreen={setActiveScreen} />;

  if (activeScreen === "multiple-choice")
    return (
      <MultipleChoiceScreen
        setActiveScreen={setActiveScreen}
        currentOptionSelected={currentMultiOptionSelected}
        setCurrentOptionSelected={setCurrentMultiOptionSelected}
      />
    );

  if (activeScreen === "reveal")
    return (
      <RevealScreen
        currentUser={currentUser}
        isCorrectFirstOrderMultipleQuestion={currentMultiOptionSelected === 1}
      />
    );
};

export default TutorialFlowScreens;
