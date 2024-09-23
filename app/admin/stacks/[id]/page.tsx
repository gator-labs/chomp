import CampaignForm from "@/app/components/CampaignForm/CampaignForm";
import { getActiveAndInactiveCampaign } from "@/app/queries/campaign";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

const CampaignPage = async ({ params: { id } }: PageProps) => {
  const campaign = await getActiveAndInactiveCampaign(+id);

  if (!campaign) return notFound();

  return <CampaignForm campaign={campaign} action="update" />;
};

export default CampaignPage;
