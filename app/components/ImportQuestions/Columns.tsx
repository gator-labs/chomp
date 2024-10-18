import { QuestionImportModel } from "@/app/schemas/questionImport";
import { ColumnDef } from "@tanstack/react-table";

import { DeckRowType } from "../DeckList/DeckList";

export const questionImportColumns = [
  "question",
  "type",
  "revealAtDate",
  "revealAtAnswerCount",
  "revealTokenAmount",
  "imageUrl",
  "binaryLeftOption",
  "binaryRightOption",
  "multipleChoiceOptionOne",
  "multipleChoiceOptionTwo",
  "multipleChoiceOptionThree",
  "multipleChoiceOptionFour",
  "optionTrue",
] as Array<keyof QuestionImportModel>;

export const columns: ColumnDef<QuestionImportModel, DeckRowType>[] = [
  { accessorKey: "question", header: "Question" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "revealAtDate", header: "Reveal At Date" },
  { accessorKey: "revealAtAnswerCount", header: "Reveal At Answer Count" },
  { accessorKey: "revealTokenAmount", header: "Reveal Token Amount" },
  { accessorKey: "imageUrl", header: "Image Url" },
  { accessorKey: "binaryLeftOption", header: "Binary Left Option" },
  { accessorKey: "binaryRightOption", header: "Binary Right Option" },
  {
    accessorKey: "multipleChoiceOptionOne",
    header: "Multiple Choice Option One",
  },
  {
    accessorKey: "multipleChoiceOptionTwo",
    header: "Multiple Choice Option Two",
  },
  {
    accessorKey: "multipleChoiceOptionThree",
    header: "Multiple Choice Option Three",
  },
  {
    accessorKey: "multipleChoiceOptionFour",
    header: "Multiple Choice Option Four",
  },
  { accessorKey: "optionTrue", header: "Option True" },
];
