import { useCallback, useState } from "react";

import { getRandomInteger } from "../utils/randomUtils";

type RandomProps = {
  min: number;
  max: number;
};

export function useRandom({ min, max }: RandomProps) {
  const [random, setRandom] = useState(getRandomInteger(min, max));
  const generateRandom = useCallback(
    ({ min, max }: RandomProps) => {
      setRandom(getRandomInteger(min, max));
    },
    [setRandom],
  );

  return { random, generateRandom, setRandom };
}
