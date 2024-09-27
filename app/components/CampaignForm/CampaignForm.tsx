"use client";

import { Campaign } from "@prisma/client";

import { campaignSchema } from "@/app/schemas/campaign";

import { createCampaign, editCampaign } from "@/app/actions/campaign";
import { uploadImageToS3Bucket } from "@/app/utils/file";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { TextInput } from "../TextInput/TextInput";
import { Button } from "../ui/button";

type CampaignFormProps = {
  campaign?: Campaign;
  action: "update" | "create";
};

export default function CampaignForm({ campaign, action }: CampaignFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
    watch,
  } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      id: campaign?.id,
      name: campaign?.name || "",
      isActive: !!campaign?.isActive,
      isVisible: !!campaign?.isVisible,
      file: [],
      image: campaign?.image || "",
    },
  });
  const file = watch("file")?.[0];

  const previewUrl = !!file ? URL.createObjectURL(file) : campaign?.image;

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        let imageUrl = campaign?.image;

        if (!!file) imageUrl = await uploadImageToS3Bucket(file);

        if (action === "create") {
          await createCampaign({
            isActive: data.isActive,
            isVisible: data.isVisible,
            name: data.name,
            image: imageUrl,
          });
        }

        if (action === "update") {
          await editCampaign({
            id: data.id,
            isActive: data.isActive,
            isVisible: data.isVisible,
            name: data.name,
            image: imageUrl,
          });
        }
      })}
    >
      <h1 className="text-3xl mb-3">
        {campaign ? `Edit campaign #${campaign.id}` : "Create campaign"}
      </h1>
      <div className="mb-3">
        <label className="block mb-1">Campaign</label>
        <TextInput variant="secondary" {...register("name")} />
        <div className="text-destructive">{errors.name?.message}</div>
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
        <label className="mr-3">Is visible</label>
        <input
          type="checkbox"
          className="mt-1"
          {...register("isVisible", { value: true })}
        />
        <div className="text-destructive">{errors.isVisible?.message}</div>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Image</label>
        {!!previewUrl && (
          <div className="w-32 h-32 relative overflow-hidden rounded-full">
            <Image
              fill
              alt="preview-image-campaign"
              src={previewUrl}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          {...register("file")}
        />

        <div className="text-destructive">{errors.file?.message as string}</div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting" : "Submit"}
      </Button>
    </form>
  );
}
