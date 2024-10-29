"use client";

import { useRouter } from "next/navigation";

import { ArrowLeftIcon } from "../Icons/ArrowLeftIcon";

const BackButton = () => {
  const router = useRouter();

  const handleBack = () => {
    router.refresh();
    router.back();
  };

  return (
    <div className="cursor-pointer" onClick={handleBack}>
      <ArrowLeftIcon />
    </div>
  );
};

export default BackButton;
