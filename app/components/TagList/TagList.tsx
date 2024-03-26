import { Tag } from "@prisma/client";
import Link from "next/link";
import { Button } from "../Button/Button";

type TagListProps = {
  tags: Tag[];
};

export function TagList({ tags }: TagListProps) {
  return (
    <table className="w-full border-separate border-spacing-2">
      <tbody>
        <tr>
          <th className="text-left">Tag</th>
          <th className="text-left">Actions</th>
        </tr>
        {tags.map((t) => (
          <tr key={t.id}>
            <td>{t.tag}</td>
            <td>
              <Link href={`/admin/tags/${t.id}`}>
                <Button variant="primary" isFullWidth={false}>
                  Edit
                </Button>
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
