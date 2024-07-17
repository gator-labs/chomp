import BannerForm from "@/app/components/BannerForm/BannerForm";
import { getBanner } from "@/app/queries/banner";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

const AdminBannerPage = async ({ params: { id } }: PageProps) => {
  const banner = await getBanner(Number(id));

  if (!banner) return notFound();

  return <BannerForm banner={banner} action="update" />;
};

export default AdminBannerPage;
