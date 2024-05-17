import { Tag } from "@prisma/client";
import { DataTable } from "../DataTable/DataTable";
import { columns } from "./Columns";

type TagListProps = {
  tags: Tag[];
};

export function TagList({ tags }: TagListProps) {
  return <DataTable columns={columns} data={tags} />;
}
