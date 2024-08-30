"use client";
import { updateProfile } from "@/app/actions/profile";
import { IMAGE_ACTION } from "@/app/constants/images";
import { useToast } from "@/app/providers/ToastProvider";
import { ProfileData } from "@/app/queries/profile";
import { profileSchemaClient } from "@/app/schemas/profile";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar } from "../Avatar/Avatar";
import { Button } from "../Button/Button";
import { ChompBackgroundProfileIcon } from "../Icons/ChompBackgroundProfileIcon";
import { CloseIcon } from "../Icons/CloseIcon";
import { PencilEditIcon } from "../Icons/PencilEditIcon";
import Sheet from "../Sheet/Sheet";
import { TextInput } from "../TextInput/TextInput";

type ProfileFormProps = {
  profile: ProfileData;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const { errorToast, successToast } = useToast();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    setValue,
    trigger,
    formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(profileSchemaClient),
    defaultValues: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      username: profile.username || "",
      image: [],
    },
  });

  const file = watch("image")?.[0] as File;

  const previewUrl = !!file ? URL.createObjectURL(file) : profile?.profileSrc;

  useEffect(() => {
    const errorMessages = Object.values(errors).map((error) => error.message!);

    if (!!errorMessages.length) {
      errorMessages.forEach((message) => errorToast(message));
    }
  }, [errors]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset(getValues());
    }
  }, [isSubmitSuccessful, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();

    formData.append("firstName", data.firstName);
    formData.append("lastName", data?.lastName);
    formData.append("username", data?.username);
    formData.append(
      "image",
      isImageRemoved ? IMAGE_ACTION.REMOVE_IMAGE : data?.image?.[0],
    );

    const res = await updateProfile(formData);

    if (!!res?.error) {
      errorToast(res?.error);
    }
    router.push("/application");
    successToast("Profile successfully updated");
  });

  const onDiscard = () => {
    if (isDirty) {
      setIsConfirmModalOpen(true);
    } else {
      router.push("/application");
    }
  };

  return (
    <form className="pt-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center bg-[#A3A3EC] h-[112px] rounded-lg p-1 relative">
          <div className="absolute inset-0 z-0 rounded-lg w-full h-full [&>*]:w-full overflow-hidden">
            <ChompBackgroundProfileIcon width={358} height={112} />
          </div>
          <div className="relative cursor-pointer">
            <Avatar
              src={isImageRemoved ? AvatarPlaceholder.src : previewUrl!}
              size="oversized"
            />
            <input
              type="file"
              className="opacity-0 w-full h-full absolute top-0 left-0 cursor-pointer z-50"
              {...register("image")}
            />
            <div className="absolute w-4 h-4 bg-white rounded-full flex items-center justify-center right-3.5 bottom-6">
              <PencilEditIcon width={8} height={8} />
            </div>
            <div
              className="absolute w-4 h-4 bg-white rounded-full flex items-center justify-center -right-0.5 bottom-[88px]"
              onClick={async () => {
                setIsImageRemoved(true);
                setValue("image", [], { shouldDirty: true });
                await trigger("image");
              }}
            >
              <CloseIcon width={8} height={8} fill="#999999" />
            </div>
          </div>
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
          disabled={isSubmitting || !isDirty}
        >
          Save changes
        </Button>
        <Button
          variant="black"
          type="button"
          className="!rounded-[32px]"
          onClick={onDiscard}
        >
          Go home
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
            You have unsaved changes
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 font-sora text-sm">
              <div>
                Would you like to continue editing your profile or discard your
                changes and go home?
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="white"
                className="flex items-center !rounded-[32px]"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                }}
              >
                Continue editing
              </Button>
              <Button
                variant="black"
                type="button"
                className="!rounded-[32px]"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  router.push("/application");
                }}
              >
                Go home
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
    </form>
  );
}
