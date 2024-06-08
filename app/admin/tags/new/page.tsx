import { createTag } from "@chomp/app/actions/tag";
import TagForm from "@chomp/app/components/TagForm/TagForm";

export default async function Page() {
  return <TagForm action={createTag} />;
}
