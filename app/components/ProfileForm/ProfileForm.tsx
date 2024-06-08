"use client";
import { profileSchema } from "@chomp/app/schemas/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../Button/Button";
import { CountdownIcon } from "../Icons/CountdownIcon";
import { TextInput } from "../TextInput/TextInput";

type ProfileFormProps = {
  profile: z.infer<typeof profileSchema>;
  action: (data: z.infer<typeof profileSchema>) => void;
};

export function ProfileForm({ profile, action }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(profileSchema),

    defaultValues: profile,
  });

  return (
    <form
      className="p-4"
      onSubmit={handleSubmit((data) => {
        startTransition(() => {
          action(data);
        });
      })}
    >
      <div className="mb-4">
        <div className="text-base text-white font-sora mb-2">Name</div>
        <div className="flex gap-2">
          <TextInput
            className="basis-1/2"
            variant="primary"
            placeholder="First name"
            disabled={isPending}
            {...register("firstName")}
          />
          <TextInput
            className="basis-1/2"
            variant="primary"
            placeholder="Last name"
            disabled={isPending}
            {...register("lastName")}
          />
        </div>
      </div>
      <div className="mb-4">
        <div className="text-base text-white font-sora mb-2">Username</div>
        <TextInput
          variant="primary"
          placeholder="Username"
          disabled={isPending}
          {...register("username")}
        />
      </div>
      <div className="mb-4">
        <div className="text-base text-white font-sora mb-2">Email</div>
        <TextInput
          variant="primary"
          placeholder="Email"
          disabled
          {...register("email")}
        />
      </div>
      <Button
        variant="white"
        type="submit"
        className="mb-4 flex items-center"
        disabled={isPending}
      >
        {isPending && <CountdownIcon />} Save changes
      </Button>
      <Link href="/application/profile">
        <Button variant="black" type="button">
          Cancel
        </Button>
      </Link>
    </form>
  );
}
