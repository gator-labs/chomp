"use client";

import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import c from "./page.module.css";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { user } = useDynamicContext();

  useEffect(() => {
    if (user) {
      redirect("/");
    }
  }, [user]);

  return (
    <main className={c.main}>
      <DynamicWidget />
    </main>
  );
}
