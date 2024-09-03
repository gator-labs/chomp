import { Campaign } from "@prisma/client";
import { DataTable } from "../DataTable/DataTable";
import { columns } from "./Columns";

interface Props {
  campaigns: Campaign[];
}

const CampaignList = ({ campaigns }: Props) => {
  return <DataTable columns={columns} data={campaigns} />;
};

export default CampaignList;
