import Image from "next/image";
import { Button } from "../Button/Button";
import { ProfileIcon } from "../Icons/ProfileIcon";
import { TextInput } from "../TextInput/TextInput";

type BotOtpAuthProps = {
  email: string;
  isEmailExist: boolean;
  otp: number;
  setOtp: (otp: number) => void;
  onSubmitOtpHandler: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function BotOtpAuth({
  email,
  isEmailExist,
  otp,
  setOtp,
  onSubmitOtpHandler,
}: BotOtpAuthProps) {
  return (
    <div className="space-y-6 flex flex-col w-3/3 p-4 items-center justify-center">
      <Image
        src="/images/chomp-asset.png"
        width={400}
        height={400}
        alt="Chomp Cover"
        className="mt-5"
      />

      <form
        key="verifyOtp"
        className="flex flex-col justify-center space-y-4 w-full"
        onSubmit={onSubmitOtpHandler}
      >
        <p className="text-[1.6rem] font-bold text-center">
          Chomp at its full potential!
        </p>
        <div className="flex w-fit bg-[#575CDF] px-4 py-2 gap-2.5 items-center rounded-[2rem]">
          <ProfileIcon width={50} height={50} />
          <span className="flex flex-col">
            <h2 className="uppercase text-sm">
              {isEmailExist ? "Linked Account" : "Linking To Telegram:"}
            </h2>
            <p className="font-medium">{email}</p>
          </span>
        </div>
        <p className="text-left">
          OTP sent to your email! Copy it and paste it here to access all of
          Chomp&apos;s features!
        </p>
        <div className="flex flex-col gap-4">
          <TextInput
            name="otp"
            placeholder="OTP"
            type="number"
            value={otp !== 0 ? otp : ""}
            onChange={(event) => {
              setOtp(parseInt(event.target.value));
            }}
            variant="primary"
            required
          />
          <Button
            variant="purple"
            size="normal"
            className="gap-2 text-black font-medium"
            isFullWidth
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}
