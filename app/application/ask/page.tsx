import AskForm from "@/app/components/AskForm/AskForm";
import { notFound } from "next/navigation";

export default async function Page() {
  if (process.env.NEXT_PUBLIC_FF_ASK !== "true") {
    return notFound();
  }

  return <AskForm />;
}
