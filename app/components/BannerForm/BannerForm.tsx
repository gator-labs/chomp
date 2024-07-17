"use client";

import { createBanner, updateBanner } from "@/app/actions/banner";
import {
  createBannerSchemaClient,
  updateBannerSchemaClient,
} from "@/app/schemas/banner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banner } from "@prisma/client";
import { useForm } from "react-hook-form";
import { Button } from "../Button/Button";
import { TextInput } from "../TextInput/TextInput";

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
      title: banner?.title || "",
      description: banner?.description || "",
      url: banner?.url || "",
      backgroundColor: banner?.backgroundColor || "#000",
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
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("url", data.url);
        formData.append("image", data.image[0]);
        formData.append("backgroundColor", data.backgroundColor);
        formData.append("isActive", data.isActive.toString());

        if (action === "create") await createBanner(formData);
        if (action === "update") await updateBanner(formData);
      })}
    >
      <h1 className="text-3xl mb-3">Banner</h1>
      <div className="mb-3">
        <label className="block mb-1">Title*</label>
        <TextInput variant="secondary" {...register("title")} />
        <div className="text-red">{errors.title?.message}</div>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Description*</label>
        <TextInput variant="secondary" {...register("description")} />
        <div className="text-red">{errors.description?.message}</div>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Url</label>
        <TextInput variant="secondary" {...register("url")} />
        <div className="text-red">{errors.url?.message}</div>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Background Color</label>
        <input type="color" {...register("backgroundColor")} />
        <div className="text-red">{errors.backgroundColor?.message}</div>
      </div>
      <div className="mb-3">
        <label className="mr-3">Is active</label>
        <input
          type="checkbox"
          className="mt-1"
          {...register("isActive", { value: true })}
        />
        <div className="text-red">{errors.isActive?.message}</div>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Image*</label>
        {!!previewUrl && (
          <div className="w-32 h-32 relative overflow-hidden mb-2">
            <img src={previewUrl} className="object-contain w-full h-full" />
          </div>
        )}
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp, .svg"
          {...register("image")}
        />

        <div className="text-red">{errors.image?.message as string}</div>
      </div>
      <Button
        variant="primary"
        type="submit"
        disabled={isSubmitting || !isDirty}
      >
        {isSubmitting ? "Submitting" : "Submit"}
      </Button>
    </form>
  );
};

export default BannerForm;
