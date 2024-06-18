"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

const LinkProgressBar = () => {
  return (
    <ProgressBar
      height="4px"
      color="#A3A3EC"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
};

export default LinkProgressBar;
