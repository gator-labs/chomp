import StackForm from "@/app/components/StackForm/StackForm";
import { getActiveAndInactiveStack } from "@/app/queries/stack";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

const StackPage = async ({ params: { id } }: PageProps) => {
  const stack = await getActiveAndInactiveStack(+id);

  if (!stack) return notFound();

  return <StackForm stack={stack} action="update" />;
};

export default StackPage;
