"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useState } from "react";
import BinaryQuestionScreen from "../BinaryQuestionScreen/BinaryQuestionScreen";
import MultipleChoiceScreen from "../MultipleChoiceScreen/MultipleChoiceScreen";
import RevealScreen from "../RevealScreen/RevealScreen";

const TutorialFlowScreens = () => {
  const { user } = useDynamicContext();
  const [activeScreen, setActiveScreen] = useState<
    "binary-question" | "multiple-choice" | "reveal" | null
  >("binary-question");

  if (!activeScreen) return null;

  if (activeScreen === "binary-question")
    return <BinaryQuestionScreen setActiveScreen={setActiveScreen} />;

  if (activeScreen === "multiple-choice")
    return <MultipleChoiceScreen setActiveScreen={setActiveScreen} />;

  if (activeScreen === "reveal") return <RevealScreen />;
};

export default TutorialFlowScreens;
