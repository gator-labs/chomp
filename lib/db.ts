import prisma from "@/app/services/prisma";

export async function deleteAllDBTestData() {
  await prisma.$executeRawUnsafe(`

  DO $$ 
  BEGIN
      -- Disable foreign key checks (if needed)
      -- ALTER TABLE ... DISABLE TRIGGER ALL;
  
      -- Delete from child tables first
      DELETE FROM "Wallet";
      DELETE FROM "Email";
      DELETE FROM "QuestionAnswer";
      DELETE FROM "QuestionOption";
      DELETE FROM "QuestionTag";
      DELETE FROM "DeckQuestion";
      DELETE FROM "UserDeck";
      DELETE FROM "ChompResult";
      DELETE FROM "FungibleAssetTransactionLog";
      DELETE FROM "RevealNft";
      DELETE FROM "MysteryBoxTrigger";
      DELETE FROM "MysteryBoxPrize";
      DELETE FROM "CampaignMysteryBoxAllowlist";
      DELETE FROM "ChainTx";
      DELETE FROM "CreditPack";
  
      -- Delete from parent tables
      DELETE FROM "User";
      DELETE FROM "Question";
      DELETE FROM "Tag";
      DELETE FROM "Deck";
      DELETE FROM "Stack";
      DELETE FROM "Banner";
      DELETE FROM "MysteryBox";
      DELETE FROM "MysteryBoxAllowlist";
      DELETE FROM "CampaignMysteryBox";
  
      -- Re-enable foreign key checks (if needed)
      -- ALTER TABLE ... ENABLE TRIGGER ALL;
  END $$;

`);
}
