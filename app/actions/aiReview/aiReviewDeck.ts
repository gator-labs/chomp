const { env } = require("@/env.js");
const { OpenAI } = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

interface ReviewIssue {
  type: "typo" | "overlap" | "spelling";
  message: string;
  field: string;
  suggestion?: string;
}

interface DeckReviewData {
  deckTitle: string;
  description?: string | null;
  footer?: string | null;
  questions: Array<{
    question: string;
    options: string[];
  }>;
}

export async function aiReviewDeck(
  deckData: DeckReviewData,
): Promise<ReviewIssue[]> {
  const issues: ReviewIssue[] = [];

  // Prepare the content for review
  const contentToReview = [
    { text: deckData.deckTitle, field: "title" },
    ...(deckData.description
      ? [{ text: deckData.description, field: "description" }]
      : []),
    ...(deckData.footer ? [{ text: deckData.footer, field: "footer" }] : []),
    ...deckData.questions.flatMap((q, idx) => [
      { text: q.question, field: `question_${idx + 1}` },
      ...q.options.map((opt, optIdx) => ({
        text: opt,
        field: `question_${idx + 1}_option_${optIdx + 1}`,
      })),
    ]),
  ];

  // Review each piece of content
  for (const { text, field } of contentToReview) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant that reviews text for:
1. Spelling mistakes and typos
2. In the case of questions, whether the answer appears within the question text
Please respond in JSON format with an array of issues found, or an empty array if no issues.
Each issue should have:
- type: "typo", "spelling", or "overlap"
- message: A clear description of the issue
- suggestion: (optional) A suggested correction`,
          },
          {
            role: "user",
            content: `Review this text: "${text}"
${
  field.startsWith("question_") && !field.includes("option")
    ? `This is a question. Check if any of these possible answers appear within it: ${deckData.questions[
        parseInt(field.split("_")[1]) - 1
      ].options.join(", ")}`
    : "This is general text to check for spelling and typos."
}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }
      const result = JSON.parse(content);
      if (result.issues && result.issues.length > 0) {
        issues.push(
          ...result.issues.map((issue: any) => ({
            ...issue,
            field,
          })),
        );
      }
    } catch (error) {
      console.error(`Error reviewing ${field}:`, error);
      // Don't throw - we want to continue reviewing other fields
    }
  }

  return issues;
}
