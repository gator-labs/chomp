/**
 * Tool to find the line of error on a sql query
 * postgresql gives you the error by character count instead of line
 * so add the problematic query here
 * and substitute the character position at the end
 */
const queryRaw = `
  ADD YOUR SQL QUERY HERE
`;

function getLineAtPosition(text, position) {
  // Split the text into lines
  const lines = text.split("\n");

  // Initialize a variable to keep track of the current position
  let currentPosition = 0;

  // Iterate through each line
  for (let i = 0; i < lines.length; i++) {
    // Calculate the length of the current line including the newline character
    const lineLength = lines[i].length + 1; // +1 for the newline character

    // Check if the position is within the current line
    if (currentPosition + lineLength > position) {
      return {
        line: lines[i],
        lineNumber: i + 1, // Line numbers are 1-based
      };
    }

    // Update the current position
    currentPosition += lineLength;
  }

  // If the position is beyond the end of the text, return null or an appropriate value
  return null;
}

console.log(queryRaw.length);

console.log(getLineAtPosition(queryRaw, 1921));
