"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../Button/Button";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button variant="primary" type="submit" aria-disabled={pending}>
      Add
    </Button>
  );
}
