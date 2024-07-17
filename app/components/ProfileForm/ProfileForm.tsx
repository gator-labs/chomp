"use client";
import { useToast } from "@/app/providers/ToastProvider";
import { profileSchema } from "@/app/schemas/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";
import { ChompBackgroundProfileIcon } from "../Icons/ChompBackgroundProfileIcon";
import Sheet from "../Sheet/Sheet";
import { TextInput } from "../TextInput/TextInput";

type ProfileFormProps = {
  profile: z.infer<typeof profileSchema>;
  action: (data: z.infer<typeof profileSchema>) => void;
};

export function ProfileForm({ profile, action }: ProfileFormProps) {
  const { errorToast } = useToast();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  useEffect(() => {
    console.log(errors);
    if (errors.firstName) {
      errorToast(errors.firstName?.message ?? "An error occurred");
    }
    if (errors.lastName) {
      errorToast(errors.lastName?.message ?? "An error occurred");
    }
    if (errors.username) {
      errorToast(errors.username?.message ?? "An error occurred");
    }
  }, [errors]);

  const onSubmit = handleSubmit((data) => {
    action(data);
  });

  const onDiscard = () => {
    if (isDirty) {
      setIsConfirmModalOpen(true);
    }
  };

  return (
    <form className="p-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center bg-[#A3A3EC] h-[112px] rounded-lg p-1 relative">
          <div className="absolute inset-0 z-0 rounded-lg w-fit h-fit">
            <ChompBackgroundProfileIcon width={358} height={112} />
          </div>
          <Avatar src="/avatars/2.png" size="oversized" />
        </div>
        <div>
          <div className="text-white font-sora text-sm font-normal mb-2">
            Name
          </div>
          <div className="flex gap-2">
            <TextInput
              className="basis-1/2 rounded-lg pl-4 text-sm font-normal"
              variant="primary"
              placeholder="First name"
              {...register("firstName")}
            />
            <TextInput
              className="basis-1/2 rounded-lg pl-4 text-sm font-normal"
              variant="primary"
              placeholder="Last name"
              {...register("lastName")}
            />
          </div>
        </div>
        <div>
          <div className="text-white font-sora text-sm font-normal mb-2">
            Username
          </div>
          <TextInput
            variant="primary"
            placeholder="Username"
            className="pl-4"
            {...register("username")}
          />
        </div>
        <Button
          variant="white"
          type="submit"
          className="flex items-center !rounded-[32px]"
        >
          Save changes
        </Button>
        <Button
          variant="black"
          type="button"
          className="!rounded-[32px]"
          onClick={onDiscard}
        >
          Discard
        </Button>
      </div>
      <Sheet
        isOpen={isConfirmModalOpen}
        setIsOpen={setIsConfirmModalOpen}
        closeIconHeight={16}
        closeIconWidth={16}
      >
        <div className="p-6 rounded-3xl">
          <div className="font-sora text-base font-bold text-[#CFC5F7] mb-6">
            Unsaved changes?
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 font-sora text-sm">
              <div>You made some changes to you profile.</div>
              <div>Would you like to discard or continue editing?</div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="white"
                className="flex items-center !rounded-[32px]"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                }}
              >
                Continue Editing
              </Button>
              <Button
                variant="black"
                type="button"
                className="!rounded-[32px]"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  router.push("/application/profile");
                }}
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
    </form>
  );
}
