import CampaignList from "@/app/components/CampaignList/CampaignList";
import { Button } from "@/app/components/ui/button";
import { getActiveAndInactiveCampaigns } from "@/app/queries/campaign";
import Link from "next/link";

const CampaignsPage = async () => {
  const campaigns = await getActiveAndInactiveCampaigns();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <Link href="/admin/campaigns/new">
          <Button>New</Button>
        </Link>
      </div>

      <CampaignList campaigns={campaigns} />
    </div>
  );
};

export default CampaignsPage;
