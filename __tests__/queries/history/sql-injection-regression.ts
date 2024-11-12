import { getQuestionsHistoryQuery } from "@/app/queries/history";

describe("SQL injection regression", () => {
  it("should not allow deckId to interfere with query", async () => {
    // We expect this to still throw an exception as the
    // deckId needs to be an integer
    await expect(
      getQuestionsHistoryQuery(
        "11111111-1111-1111-1111-111111111111",
        100,
        1,
        // @ts-expect-error prettier prefers this to ts-ignore
        "'",
      ),
    ).rejects.not.toThrow(/unterminated quoted string/);
  });
});
