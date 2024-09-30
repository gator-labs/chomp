import { TagList } from "@/app/components/TagList/TagList";
import { Button } from "@/app/components/ui/button";
import { getTags } from "@/app/queries/tag";
import Link from "next/link";

export default async function Page() {
  const tags = await getTags();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <Link href="/admin/tags/new">
          <Button>New</Button>
        </Link>
      </div>

      <TagList tags={tags} />
    </div>
  );
}
