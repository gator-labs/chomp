import { Mutex, MutexInterface, tryAcquire } from "async-mutex";

type MutexData = {
  identifier: string;
  data: object;
};

const mutexes: Map<string, Mutex> = new Map();

const setMutex = ({ identifier, data }: MutexData): Mutex => {
  const mutex = new Mutex();
  mutexes.set(JSON.stringify({ identifier, data }), mutex);
  return mutex;
};

const getMutex = ({ identifier, data }: MutexData): Mutex | undefined => {
  return mutexes.get(JSON.stringify({ identifier, data }));
};

export const acquireMutex = async ({
  identifier,
  data,
}: MutexData): Promise<MutexInterface.Releaser> => {
  let mutex = getMutex({ identifier, data });
  if (!mutex) mutex = setMutex({ identifier, data });

  const release = await mutex.acquire();
  return release;
};

export const tryAcquireMutex = async ({
  identifier,
  data,
}: MutexData): Promise<MutexInterface.Releaser | null> => {
  let mutex = getMutex({ identifier, data });
  if (!mutex) mutex = setMutex({ identifier, data });

  try {
    const release = await tryAcquire(mutex).acquire();
    return release;
  } catch {
    return null;
  }
};
