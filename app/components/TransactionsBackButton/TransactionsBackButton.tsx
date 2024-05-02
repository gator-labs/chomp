"use client";
import { useRouter } from "next/navigation";
import { Button } from "../Button/Button";

export function TransactionsBackButton() {
  const router = useRouter();
  return (
    <Button isFullWidth variant="black" isPill onClick={() => router.back()}>
      Close
    </Button>
  );
}
