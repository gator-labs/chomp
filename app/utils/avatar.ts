import path from "path";
import { shuffleArray } from "./randomUtils";

export const filePathForPlaceholderAvatars = Array.from({ length: 5 }).map(
  (_, index) => `${index}.png`,
);

export const getRandomAvatarPath = (): string => {
  return path.join(
    "/",
    "avatars",
    shuffleArray(filePathForPlaceholderAvatars)[0],
  );
};
