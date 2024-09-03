"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HalfArrowLeftIcon } from "../Icons/HalfArrowLeftIcon";

const BackButton = () => {
  const router = useRouter();
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    const previousURL = document.referrer;
    const currentOrigin = window.location.origin;

    if (previousURL.startsWith(currentOrigin)) {
      setIsInternal(true);
    } else {
      setIsInternal(false);
    }
  }, []);

  const handleBack = () => {
    if (isInternal) {
      router.refresh();
      router.back();
    } else {
      router.refresh();
      router.push("/application");
    }
  };

  return (
    <div className="cursor-pointer" onClick={handleBack}>
      <HalfArrowLeftIcon />
    </div>
  );
};

export default BackButton;
