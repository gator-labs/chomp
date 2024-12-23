# AI Review System

This system provides automated review of deck content using OpenAI's GPT-3.5-turbo model to detect potential issues like typos, spelling mistakes, and answers mentioned in questions.

## Database Synchronization

The AI review system operates with the following data synchronization characteristics:

- **Immediate Review**: The AI review is triggered immediately when a deck is created or updated, using the main database's data.
- **Database Replication**: The database replica used for other operations is synced hourly, which means:
  - AI reviews are processed using real-time data from the main database
  - Other operations accessing the replica may see deck updates with up to a 1-hour delay
  - This delay does not affect the AI review functionality since it operates on the primary database

## Notification System

Issues detected by the AI review system are immediately sent to Slack using a webhook integration. The notification includes:
- Deck ID reference
- Detailed description of each issue
- Field where the issue was found
- Suggested fixes (when available)

## Implementation Details

The system is implemented across three main components:

1. `aiReviewDeck.ts` - Core AI review logic using OpenAI
2. `slackNotifications.ts` - Slack integration for issue reporting
3. Integration points in `deck.ts` for both create and edit operations

The review process is asynchronous and does not block deck creation or updates, ensuring a smooth user experience while maintaining content quality through automated reviews.
