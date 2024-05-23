import { z, ZodError } from "zod";

export async function processCsv<T extends object>(
  file: Blob,
  columns: Array<keyof T>,
  zodSchema: z.ZodType,
): Promise<{ values: Array<T>; errors: Array<ZodError> }> {
  const contentOfFile = await file.text();
  const rows = contentOfFile.split(/\r?\n/);
  rows.splice(0, 1);
  rows.pop();

  const objects = rows.map((row) => {
    const cells = row.split(",");
    return columns.reduce(
      (acc, key, index) => {
        acc[key as string] = cells[index];
        return acc;
      },
      {} as { [key: string]: string },
    );
  });

  const results = objects.map((object) => {
    const result = zodSchema.safeParse(object);
    if (result.success) {
      return { value: result.data };
    }

    return { error: result.error };
  });

  return {
    values: results
      .filter((result) => result.value)
      .map((result) => result.value ?? ({} as T)),
    errors: results
      .filter((result) => result.error)
      .map((result) => result.error ?? ({} as ZodError)),
  };
}
