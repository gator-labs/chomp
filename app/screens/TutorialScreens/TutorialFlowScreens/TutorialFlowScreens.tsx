"use client";

import { useState } from "react";
import BinaryQuestionScreen from "../BinaryQuestionScreen/BinaryQuestionScreen";
import MultipleChoiceScreen from "../MultipleChoiceScreen/MultipleChoiceScreen";

const TutorialFlowScreens = () => {
  const [activeScreen, setActiveScreen] = useState<
    "binary-question" | "multiple-choice" | "reveal"
  >("binary-question");

  if (activeScreen === "binary-question")
    return <BinaryQuestionScreen setActiveScreen={setActiveScreen} />;

  if (activeScreen === "multiple-choice")
    return <MultipleChoiceScreen setActiveScreen={setActiveScreen} />;

  if (activeScreen === "reveal") return <div>Reveal screen</div>;
};

export default TutorialFlowScreens;
