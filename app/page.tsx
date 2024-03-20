"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { PageLayout } from "./components/PageLayout/PageLayout";

export default function Page() {
  const { handleLogOut } = useDynamicContext();

  return (
    <PageLayout>
      home page
      <div>
        <button onClick={() => handleLogOut()}>Log out</button>
      </div>
    </PageLayout>
  );
}
