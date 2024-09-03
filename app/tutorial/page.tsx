import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { AuthRedirect } from "../components/AuthRedirect/AuthRedirect";
import { Navbar } from "../components/Navbar/Navbar";
import { TabNavigation } from "../components/TabNavigation/TabNavigation";

import ConfettiProvider from "../providers/ConfettiProvider";
import { getCurrentUser } from "../queries/user";
import TutorialFlowScreens from "../screens/TutorialScreens/TutorialFlowScreens/TutorialFlowScreens";

const TutorialPage = async () => {
  const currentDate = new Date();

  const formattedDate = format(currentDate, "MMMM do EEEE", { locale: enUS });

  const currentUser = (await getCurrentUser())!;

  return (
    <ConfettiProvider>
      <div className="flex flex-col h-full relative">
        <AuthRedirect />

        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-85" />

        <main
          id="tutorial-container"
          className="flex-grow overflow-y-auto mb-2 w-full max-w-lg mx-auto flex flex-col"
        >
          <div className="px-6">
            <Navbar
              avatarSrc={AvatarPlaceholder.src}
              address=""
              bonkBalance={0}
              solBalance={0}
              transactions={[]}
            />
          </div>
          <div className="px-6 py-5 mb-2">
            <p className="text-sm">{formattedDate}</p>
          </div>

          <TutorialFlowScreens currentUser={currentUser} />
        </main>

        <TabNavigation isAdmin={currentUser.isAdmin} />
      </div>
    </ConfettiProvider>
  );
};

export default TutorialPage;
