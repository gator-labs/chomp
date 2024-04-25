import { z } from "zod";

export function formatErrorsToString(
  validatedFields: z.SafeParseError<Record<string, any>>,
): string {
  const fieldErrors = validatedFields.error.flatten().fieldErrors;
  const message = Object.keys(fieldErrors).reduce((acc, key) => {
    if (acc === "") {
      return reduceFieldErrorToString(key, fieldErrors[key]);
    }

    return acc + ", " + reduceFieldErrorToString(key, fieldErrors[key]);
  }, "");

  return message;
}

function reduceFieldErrorToString(
  key: string,
  fieldErrors: string[] | undefined,
): string {
  if (!fieldErrors) {
    return "";
  }

  return `${key.substring(0, 1).toUpperCase()}${key.substring(1).toLowerCase()}: ${fieldErrors
    ?.reduce((acc, error) => {
      if (acc === "") {
        return error;
      }

      return acc + ", " + error;
    }, "")
    .toLowerCase()}`;
}
