import { DotLottiePlayer } from "@dotlottie/react-player";
import { ReactPortal } from "../ReactPortal/ReactPortal";

type ChompFullScreenLoaderProps = {
  isLoading: boolean;
  loadingMessage: string;
};

export default function ChompFullScreenLoader({
  isLoading,
  loadingMessage,
}: ChompFullScreenLoaderProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <ReactPortal wrapperId="chomp-loader">
      <div className="fixed top-0 left-0 w-screen h-screen z-[99] bg-black bg-opacity-90">
        <div className="flex flex-col absolute top-1/3 left-1/2 -translate-x-1/2 gap-2">
          <div className="rounded-full overflow-hidden flex justify-center items-center w-fit ">
            <DotLottiePlayer
              className="w-32 h-32"
              loop
              autoplay
              src="/lottie/chomp.lottie"
            />
          </div>
          <p className="text-base text-white w-full text-center">{loadingMessage}</p>
        </div>
      </div>
    </ReactPortal>
  );
}
