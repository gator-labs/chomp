import Image from "next/image";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { HalfArrowRightIcon } from "../Icons/HalfArrowRightIcon";
import { TextInput } from "../TextInput/TextInput";

type BotLoginProps = {
  email: string;
  setEmail: (email: string) => void;
  isEmailExist: boolean;
  isTermAccepted: boolean;
  setIsTermAccepted: (isTermAccepted: boolean) => void;
  onSubmitEmailHandler: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function BotLogin({
  email,
  setEmail,
  isEmailExist,
  isTermAccepted,
  setIsTermAccepted,
  onSubmitEmailHandler,
}: BotLoginProps) {
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
        key="emailVerification"
        onSubmit={onSubmitEmailHandler}
        className="flex flex-col justify-center space-y-4 w-full"
      >
        <p className="text-[1.6rem] font-bold text-center">
          Chomp at its full potential!
        </p>
        <p className="text-left">
          To access all features of Chomp (i.e revealing answer, viewing
          results, earning BONK), you can register by entering your e-mail
          below.
        </p>
        <div className="flex flex-col gap-4">
          <TextInput
            name="email"
            placeholder="ENTER YOUR EMAIL HERE"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            variant="primary"
            required
            readOnly={isEmailExist}
          />
          {!isEmailExist && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="term"
                checked={isTermAccepted}
                onClick={() => setIsTermAccepted(!isTermAccepted)}
              />
              <label
                htmlFor="term"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this email will be permanantly linked to this
                Telegram account.
              </label>
            </div>
          )}
          <Button
            variant="purple"
            size="normal"
            className="gap-2 text-black font-medium"
            isFullWidth
            disabled={!isEmailExist && !isTermAccepted}
          >
            Send OTP <HalfArrowRightIcon fill="#000" width={18} height={18} />
          </Button>
        </div>
      </form>
    </div>
  );
}
