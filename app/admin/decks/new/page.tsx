import { createDeck } from "@/app/actions/deck/deck";
import DeckForm from "@/app/components/DeckForm/DeckForm";
import { getCampaigns } from "@/app/queries/campaign";
import { getTags } from "@/app/queries/tag";

export default async function Page() {
  const tags = await getTags();
  const campaigns = await getCampaigns();

  return <DeckForm action={createDeck} tags={tags} campaigns={campaigns} />;
}
