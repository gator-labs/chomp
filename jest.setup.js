import prisma from "@/app/services/prisma";
import "@testing-library/jest-dom";

/**
 * Function to get row counts for all tables in the database.
 * @returns {Promise<Object>} An object where keys are table names and values are row counts.
 * TODO: How do we ensure we keep this in sync with our DB?
 */
async function getRowCounts() {
  return {
    User: await prisma.user.count(),
    Wallet: await prisma.wallet.count(),
    Email: await prisma.email.count(),
    Question: await prisma.question.count(),
    QuestionOption: await prisma.questionOption.count(),
    Tag: await prisma.tag.count(),
    QuestionTag: await prisma.questionTag.count(),
    Deck: await prisma.deck.count(),
    UserDeck: await prisma.userDeck.count(),
    DeckQuestion: await prisma.deckQuestion.count(),
    QuestionAnswer: await prisma.questionAnswer.count(),
    ChompResult: await prisma.chompResult.count(),
    FungibleAssetTransactionLog:
      await prisma.fungibleAssetTransactionLog.count(),
    RevealNft: await prisma.revealNft.count(),
    Stack: await prisma.stack.count(),
    Banner: await prisma.banner.count(),
    MysteryBox: await prisma.mysteryBox.count(),
    MysteryBoxTrigger: await prisma.mysteryBoxTrigger.count(),
    MysteryBoxPrize: await prisma.mysteryBoxPrize.count(),
    MysteryBoxAllowlist: await prisma.mysteryBoxAllowlist.count(),
    ChainTx: await prisma.chainTx.count(),
    CampaignMysteryBox: await prisma.campaignMysteryBox.count(),
    CampaignMysteryBoxAllowlist:
      await prisma.campaignMysteryBoxAllowlist.count(),
    CreditPack: await prisma.creditPack.count(),
  };
}

beforeAll(async () => {
  global.initialRowCounts = await getRowCounts();
  //console.log(
  //  "Shared beforeAll: Running before all tests in this file",
  //  global.initialRowCounts,
  //);
});

afterAll(async () => {
  const finalRowCounts = await getRowCounts();

  for (const [table, initialCount] of Object.entries(global.initialRowCounts)) {
    if (finalRowCounts[table] !== initialCount) {
      console.error("InitialCount", global.initialRowCounts);
      console.error("FinalCount", finalRowCounts);
      throw new Error(`Row count mismatch for table ${table}`);
    }
  }
});
