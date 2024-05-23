import dayjs from "dayjs";
import { useCallback, useState } from "react";

export function useStopwatch() {
  const [startTime, setStartTime] = useState<Date>();
  const getTimePassedSinceStart = useCallback(() => {
    return dayjs(new Date()).diff(startTime);
  }, [startTime]);

  const start = useCallback(() => {
    setStartTime(new Date());
  }, [setStartTime]);

  return { start, reset: start, getTimePassedSinceStart };
}
