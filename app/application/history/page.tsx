import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import HistoryList from "@/components/HistoryNew/HistoryList";

export default async function Page() {

    return (
      <div className="flex flex-col gap-4 overflow-hidden">
        <ProfileNavigation />
        <HistoryList />
      </div>
  );
}
