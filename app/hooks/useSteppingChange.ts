import { useCallback } from "react";
const STEP_SIZE = 1;

type UseSettpingChangeProps = {
  percentage: number;
  onPercentageChange?: (newPercentage: number) => void;
  step?: number;
};

export function useSteppingChange({
  percentage,
  onPercentageChange,
  step = STEP_SIZE,
}: UseSettpingChangeProps) {
  const handlePercentageChange = useCallback(
    (newPercentage: number) => {
      const stepUp = percentage + step;
      const stepDown = percentage - step;
      let percentageStep = percentage;

      if (newPercentage >= stepUp) {
        percentageStep = stepUp;
      }

      if (newPercentage <= stepDown) {
        percentageStep = stepDown;
      }

      if (newPercentage < 2) {
        percentageStep = 0;
      }

      if (newPercentage > 100) {
        percentageStep = 100;
      }

      onPercentageChange && onPercentageChange(percentageStep);
    },
    [percentage, onPercentageChange],
  );

  return { handlePercentageChange };
}
