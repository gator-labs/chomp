import { Stack } from "@prisma/client";
import { DataTable } from "../DataTable/DataTable";
import { columns } from "./Columns";

interface Props {
  stacks: Stack[];
}

const StackList = ({ stacks }: Props) => {
  return <DataTable columns={columns} data={stacks} />;
};

export default StackList;
