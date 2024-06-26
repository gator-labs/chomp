"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../Button/Button";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button variant="primary" type="submit" disabled={pending}>
      Submit
    </Button>
  );
}
