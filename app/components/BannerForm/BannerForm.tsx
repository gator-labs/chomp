"use client";

import { createBanner, updateBanner } from "@/app/actions/banner";
import {
  createBannerSchemaClient,
  updateBannerSchemaClient,
} from "@/app/schemas/banner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banner } from "@prisma/client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { TextInput } from "../TextInput/TextInput";
import { Button } from "../ui/button";

interface Props {
  banner?: Banner;
  action: "update" | "create";
}

const BannerForm = ({ banner, action }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
  } = useForm({
    resolver: zodResolver(
      action === "create" ? createBannerSchemaClient : updateBannerSchemaClient,
    ),
    defaultValues: {
      id: banner?.id,
      url: banner?.url || "",
      isActive: !!banner?.isActive,
      image: [],
    },
  });

  const file = watch("image")?.[0] as File;

  const previewUrl = !!file ? URL.createObjectURL(file) : banner?.image;

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const formData = new FormData();

        formData.append("id", banner?.id.toString() || "");
        formData.append("url", data.url);
        formData.append("image", data.image[0]);
        formData.append("isActive", data.isActive.toString());

        if (action === "create") await createBanner(formData);
        if (action === "update") await updateBanner(formData);
      })}
    >
      <h1 className="text-3xl mb-3">Banner</h1>
      <div className="mb-3">
        <label className="block mb-1">Url</label>
        <TextInput variant="secondary" {...register("url")} />
        <div className="text-destructive">{errors.url?.message}</div>
      </div>
      <div className="mb-3">
        <label className="mr-3">Is active</label>
        <input
          type="checkbox"
          className="mt-1"
          {...register("isActive", { value: true })}
        />
        <div className="text-destructive">{errors.isActive?.message}</div>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Image*</label>
        {!!previewUrl && (
          <div className="w-32 h-32 relative overflow-hidden mb-2">
            <Image
              fill
              src={previewUrl}
              alt="banner-image"
              className="object-contain w-full h-full"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp, .svg"
          {...register("image")}
        />

        <div className="text-destructive">{errors.image?.message as string}</div>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || !isDirty}
      >
        {isSubmitting ? "Submitting" : "Submit"}
      </Button>
    </form>
  );
};

export default BannerForm;
