import { editTag } from "@chomp/app/actions/tag";
import TagForm from "@chomp/app/components/TagForm/TagForm";
import { getTagSchema } from "@chomp/app/queries/tag";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function Page({ params: { id } }: PageProps) {
  const tag = await getTagSchema(+id);

  if (!tag) {
    return notFound();
  }

  return <TagForm action={editTag} tag={tag} />;
}
