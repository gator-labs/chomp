import { PageProps } from "@/.next/types/app/layout";
import { editCampaign } from "@/app/actions/campaign";
import CampaignForm from "@/app/components/CampaignForm/CampaignForm";
import { getCampaign } from "@/app/queries/campaign";
import { notFound } from "next/navigation";

const CampaignPage = async ({ params: { id } }: PageProps) => {
  const campaign = await getCampaign(+id);

  if (!campaign) return notFound();

  return <CampaignForm campaign={campaign} action={editCampaign} />;
};

export default CampaignPage;
