import { AskWizard } from "@/components/AskWizard/AskWizard";
import { notFound } from "next/navigation";

export default async function Page() {
  if (process.env.NEXT_PUBLIC_FF_ASK !== "true") {
    return notFound();
  }

  return <AskWizard />;
}
