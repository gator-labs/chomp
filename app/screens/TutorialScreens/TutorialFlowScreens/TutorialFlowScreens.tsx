"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import BinaryQuestionScreen from "../BinaryQuestionScreen/BinaryQuestionScreen";
import MultipleChoiceScreen from "../MultipleChoiceScreen/MultipleChoiceScreen";
import RevealScreen from "../RevealScreen/RevealScreen";

const TutorialFlowScreens = () => {
  const { user } = useDynamicContext();
  const [activeScreen, setActiveScreen] = useState<
    "binary-question" | "multiple-choice" | "reveal" | null
  >(null);

  const seenTutorialScreens = JSON.parse(
    localStorage.getItem(`${user?.userId}-seen-tutorial-screens`) || "[]",
  );

  useEffect(() => {
    if (seenTutorialScreens?.includes("multiple-choice")) {
      return setActiveScreen("reveal");
    }
    if (seenTutorialScreens?.includes("binary-question")) {
      return setActiveScreen("multiple-choice");
    }

    setActiveScreen("binary-question");
  }, []);

  if (!activeScreen) return null;

  if (activeScreen === "binary-question")
    return <BinaryQuestionScreen setActiveScreen={setActiveScreen} />;

  if (activeScreen === "multiple-choice")
    return <MultipleChoiceScreen setActiveScreen={setActiveScreen} />;

  if (activeScreen === "reveal") return <RevealScreen />;
};

export default TutorialFlowScreens;
