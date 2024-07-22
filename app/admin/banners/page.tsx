import BannerList from "@/app/components/BannerList/BannerList";
import { Button } from "@/app/components/Button/Button";
import { getBanners } from "@/app/queries/banner";
import Link from "next/link";

const AdminBannersPage = async () => {
  const banners = await getBanners();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <Link href="/admin/banners/new">
          <Button variant="primary">New</Button>
        </Link>
      </div>

      <BannerList banners={banners} />
    </div>
  );
};

export default AdminBannersPage;
