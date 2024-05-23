"use client";

import { useState } from "react";
import BinaryQuestionScreen from "../BinaryQuestionScreen/BinaryQuestionScreen";

const TutorialFlowScreens = () => {
  const [activeScreen, setActiveScreen] = useState<
    "binary-question" | "multiple-choice" | "reveal"
  >("binary-question");

  if (activeScreen === "binary-question")
    return <BinaryQuestionScreen setActiveScreen={setActiveScreen} />;

  if (activeScreen === "multiple-choice")
    return <div>Multiple choice screen is in progress...</div>;

  if (activeScreen === "reveal") return;
  return <div>Reveal screen</div>;
};

export default TutorialFlowScreens;
