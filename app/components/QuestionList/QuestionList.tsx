import { Question, QuestionTag, Tag as TagType } from "@prisma/client";
import { DataTable } from "../DataTable/DataTable";
import { columns } from "./Columns";

export type QuestionRowType = Question & {
  questionTags: (QuestionTag & { tag: TagType })[];
};
type QuestionListProps = {
  questions: QuestionRowType[];
};

export function QuestionList({ questions }: QuestionListProps) {
  return <DataTable columns={columns} data={questions} />;
}
