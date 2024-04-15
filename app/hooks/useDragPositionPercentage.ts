import { MutableRefObject, useCallback, useState } from "react";

type UseDragPositionPercentageProps = {
  elementRef: MutableRefObject<HTMLDivElement | null>;
  onChange?: (value: number) => void;
};

export function useDragPositionPercentage({
  elementRef,
  onChange,
}: UseDragPositionPercentageProps) {
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = useCallback(() => {
    setIsDragging(true);
  }, [setIsDragging]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  const handleChangePosition = useCallback(
    (
      event:
        | React.MouseEvent<HTMLDivElement>
        | React.TouchEvent<HTMLDivElement>,
      isDrag = true,
    ) => {
      if (!isDragging && isDrag) return;
      const rect = elementRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 0;
      const left = rect?.left ?? 0;
      const clientX =
        (event as React.MouseEvent)?.clientX ??
        (event as React.TouchEvent).touches[0].clientX;
      const percentage = (clientX - left) / width;
      onChange && onChange(Math.round(percentage * 100));
    },
    [isDragging, onChange],
  );

  return { handleChangePosition, startDrag, endDrag, isDragging };
}
