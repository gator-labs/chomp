import { createCampaign } from "@/app/actions/campaign";
import CampaignForm from "@/app/components/CampaignForm/CampaignForm";

const NewCampaign = () => {
  return <CampaignForm action={createCampaign} />;
};

export default NewCampaign;
