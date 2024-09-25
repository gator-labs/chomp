import { Button } from "@/app/components/Button/Button";
import CampaignList from "@/app/components/CampaignList/CampaignList";
import { getActiveAndInactiveCampaigns } from "@/app/queries/campaign";
import { ADMIN_PATH, STACKS_PATH } from "@/lib/urls";
import Link from "next/link";

const CampaignsPage = async () => {
  const campaigns = await getActiveAndInactiveCampaigns();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <Link href={`${ADMIN_PATH}${STACKS_PATH}/new`}>
          <Button variant="primary">New</Button>
        </Link>
      </div>

      <CampaignList campaigns={campaigns} />
    </div>
  );
};

export default CampaignsPage;
