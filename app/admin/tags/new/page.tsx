import { createTag } from "@/app/actions/tag";
import TagForm from "@/app/components/TagForm/TagForm";

export default async function Page() {
  return <TagForm action={createTag} />;
}
