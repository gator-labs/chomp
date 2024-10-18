"use client";

import { useCallback, useEffect, useState } from "react";

import Circle from "../Icons/CircleIcon";
import { CloseIcon } from "../Icons/CloseIcon";

interface Props {
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  progressDuration: number;
}

const ProgressCloseButton = ({ onClick, progressDuration }: Props) => {
  const [progress, setProgress] = useState<number>(0);

  const calculateProgress = useCallback(
    (elapsedTime: number, totalTime: number): number => {
      return (elapsedTime / totalTime) * 100;
    },
    [],
  );

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progress = calculateProgress(elapsedTime, progressDuration);
      setProgress(Math.min(progress, 100));

      if (elapsedTime >= progressDuration) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [progressDuration, calculateProgress]);

  return (
    <div onClick={onClick}>
      <Circle percentage={progress} color="#CFC5F7">
        <CloseIcon
          width={16}
          height={16}
          x="5px"
          y="5px"
          dominantBaseline="central"
          textAnchor="middle"
        />
      </Circle>
    </div>
  );
};

export default ProgressCloseButton;
