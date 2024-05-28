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
  const keyFormatted = key.split(/(?=[A-Z])/).reduce((acc, curr) => {
    if (!acc) {
      return curr.slice(0, 1).toUpperCase() + curr.slice(1);
    }

    return acc + " " + curr.slice(0, 1).toLowerCase() + curr.slice(1);
  }, "");

  return `${keyFormatted}: ${fieldErrors?.reduce((acc, error) => {
    if (acc === "") {
      return error;
    }

    return acc + ", " + error;
  }, "")}`;
}
