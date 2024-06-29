import * as readline from "readline";
import { v4 as uuidv4 } from "uuid";

export function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    }),
  );
}

export async function selectOption(
  prompt: string,
  options: string[],
): Promise<string> {
  console.log(prompt);
  options.forEach((option, index) => {
    console.log(`${index + 1}. ${option}`);
  });

  const answer = await askQuestion("Please enter the number of your choice: ");
  const choiceIndex = parseInt(answer) - 1;

  if (choiceIndex >= 0 && choiceIndex < options.length) {
    return options[choiceIndex];
  } else {
    console.log("Invalid choice. Please try again.");
    return selectOption(prompt, options);
  }
}

export async function generateUsers(count: number) {
  const users: { id: string; username: string }[] = [];
  for (let i = 0; i < count; i++) {
    users.push({
      id: uuidv4(),
      username: `user${i + 1}`,
    });
  }

  return users;
}
