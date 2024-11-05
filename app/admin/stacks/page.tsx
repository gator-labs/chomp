import { Button } from "@/app/components/Button/Button";
import StackList from "@/app/components/StackList/StackList";
import { getActiveAndInactiveStacks } from "@/app/queries/stack";
import { ADMIN_PATH, STACKS_PATH } from "@/lib/urls";
import Link from "next/link";

const StacksPage = async () => {
  const stacks = await getActiveAndInactiveStacks();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <Link href={`${ADMIN_PATH}${STACKS_PATH}/new`}>
          <Button variant="primary">New</Button>
        </Link>
      </div>

      <StackList stacks={stacks} />
    </div>
  );
};

export default StacksPage;
