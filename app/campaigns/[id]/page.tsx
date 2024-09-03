import { HomeFeedDeckCard } from "@/app/components/HomeFeedDeckCard/HomeFeedDeckCard";
import Main from "@/app/components/Main/Main";
import { getCampaign } from "@/app/queries/campaign";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

const CampaignPage = async ({ params: { id } }: PageProps) => {
  const campaign = await getCampaign(+id);

  if (!campaign) return notFound();

  return (
    <Main>
      <div className="flex flex-col gap-10">
        <div>
          <h1 className="text-3xl mb-4">Campaing info</h1>
          <ul>
            <li className="flex gap-2 items-center">
              <p>Image: </p>
              <img
                className="w-10 h-10 rounded-full"
                src={campaign.image}
                alt={campaign.name}
              />
            </li>
            <li className="flex gap-2 items-center">
              <p>Name: </p>
              <p>{campaign.name}</p>
            </li>
            <li className="flex gap-2 items-center">
              <p>Is active: </p>
              <p>{campaign.isActive.toString()}</p>
            </li>
            <li className="flex gap-2 items-center">
              <p>Is visible: </p>
              <p>{campaign.isVisible.toString()}</p>
            </li>
          </ul>
        </div>

        <div>
          <h1 className="text-3xl mb-4">Decks</h1>

          <ul className="flex flex-col gap-2">
            {campaign.deck.map((deck) => (
              <HomeFeedDeckCard
                key={deck.id}
                deck={deck.deck}
                deckId={deck.id}
                imageUrl={campaign.image}
                revealAtDate={deck.revealAtDate}
              />
            ))}
          </ul>
        </div>
      </div>
    </Main>
  );
};

export default CampaignPage;
