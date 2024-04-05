import { Question } from "@prisma/client";
import { MultipleChoiceAnsweredContent } from "../components/MultipleChoiceAnsweredContent/MultipleChoiceAnsweredContent";
import { BooleanAnsweredContent } from "../components/BooleanAnsweredContent/BooleanAnsweredContent";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";

export const AnsweredQuestionContentFactory = (element: Question) => {
  const baseProps = {
    questionOptions: (element as any).questionOptions,
    avatarSrc: AvatarPlaceholder.src,
  };

  switch (element.type) {
    case "MultiChoice":
      return <MultipleChoiceAnsweredContent {...baseProps} />;
    case "TrueFalse":
      return <BooleanAnsweredContent {...baseProps} />;
    case "YesNo":
      return <BooleanAnsweredContent {...baseProps} />;
    default:
      return <></>;
  }
};
