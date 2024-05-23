import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { Navbar } from "../components/Navbar/Navbar";
import { TabNavigation } from "../components/TabNavigation/TabNavigation";
import TutorialFlowScreens from "../screens/TutorialScreens/TutorialFlowScreens/TutorialFlowScreens";

const TutorialPage = () => {
  return (
    <div className="flex flex-col h-full relative pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-85" />

      <main className="flex-grow overflow-y-auto mb-2 w-full max-w-lg mx-auto flex flex-col">
        <Navbar
          avatarSrc={AvatarPlaceholder.src}
          avatarLink="/application/profile"
          walletLink="/application/transactions"
        />

        <TutorialFlowScreens />
      </main>

      <TabNavigation />
    </div>
  );
};

export default TutorialPage;
