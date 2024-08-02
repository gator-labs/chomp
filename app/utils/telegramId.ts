export function extractId(jsonString: string): string {
  try {
    const parsedObject = JSON.parse(jsonString);

    if (parsedObject.id !== undefined) {
      return String(parsedObject.id);
    } else {
      return "";
    }
  } catch (error) {
    console.error("Error parsing JSON string");
    return "";
  }
}
