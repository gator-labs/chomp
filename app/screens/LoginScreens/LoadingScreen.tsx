import { ProgressBar } from "@/app/components/ProgressBar/ProgressBar";
import { DotLottiePlayer } from "@dotlottie/react-player";

const LoadingScreen = () => {
  return (
    <main className="fixed top-0 right-0 bottom-0 left-0 flex justify-center items-center h-dvh bg-[#1B1B1B]">
      <div>
        <div className="rounded-full overflow-hidden flex justify-center items-center m-6">
          <DotLottiePlayer
            className="w-32 h-32"
            loop
            autoplay
            src="/lottie/chomp.lottie"
          />
        </div>
        <ProgressBar className="mt-4" />
        <div className="text-center font-sora text-sm mt-4">
          Loading your chomps...
        </div>
      </div>
    </main>
  );
};

export default LoadingScreen;
