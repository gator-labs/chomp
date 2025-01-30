"use client";

import { useRouter } from "next/navigation";

import { ArrowLeftIcon } from "../Icons/ArrowLeftIcon";

type BackButtonProps = {
  text?: string;
};

const BackButton = ({ text }: BackButtonProps) => {
  const router = useRouter();

  const handleBack = () => {
    router.refresh();
    router.back();
  };

  return (
    <div className="cursor-pointer flex gap-6" onClick={handleBack}>
      <ArrowLeftIcon /> {text && <span>{text}</span>}
    </div>
  );
};

export default BackButton;
