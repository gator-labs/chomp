import { Banner } from "@prisma/client";
import { DataTable } from "../DataTable/DataTable";
import { columns } from "./Columns";

interface Props {
  banners: Banner[];
}

const BannerList = ({ banners }: Props) => {
  return <DataTable columns={columns} data={banners} />;
};

export default BannerList;
