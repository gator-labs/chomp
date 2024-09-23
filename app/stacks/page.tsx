import CampaignCard from "@/app/components/CampaignCard/CampaignCard";
import CampaignsHeader from "@/app/components/CampaignsHeader/CampaignsHeader";

import { getAllCampaigns } from "@/app/queries/campaign";

const CampaignsPage = async () => {
  const campaigns = await getAllCampaigns();

  return (
    <div className="pt-4 flex flex-col gap-8 overflow-hidden w-full max-w-lg mx-auto px-4">
      <CampaignsHeader backAction="back" heading="Stacks" />
      <ul className="flex flex-col gap-2 pb-2 overflow-auto">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            imageSrc={campaign.image}
            decksToAnswer={campaign.decksToAnswer?.length}
            decksToReveal={campaign.decksToReveal?.length}
            name={campaign.name}
            id={campaign.id}
          />
        ))}
      </ul>
    </div>
  );
};

export default CampaignsPage;
