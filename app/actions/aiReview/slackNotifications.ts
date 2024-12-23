import { env } from "@/env";

interface ReviewIssue {
  type: "typo" | "overlap" | "spelling";
  message: string;
  field: string;
  suggestion?: string;
}

export async function notifySlack(issues: ReviewIssue[], deckId: number) {
  if (!issues.length) return;

  const webhookUrl = env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("Slack webhook URL not configured");
    return;
  }

  const formatIssue = (issue: ReviewIssue) => {
    const base = `• *${issue.field}*: ${issue.message}`;
    return issue.suggestion
      ? `${base}\n  Suggestion: ${issue.suggestion}`
      : base;
  };

  const text = `🔍 *AI Review Found Issues in Deck #${deckId}*\n\n${issues.map(formatIssue).join("\n")}`;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (error) {
    console.error("Error sending Slack notification:", error);
  }
}
