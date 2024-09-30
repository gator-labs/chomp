"use client";

import { Campaign } from "@prisma/client";

import { stackSchema } from "@/app/schemas/stack";

import { createStack, editStack } from "@/app/actions/stack";
import { uploadImageToS3Bucket } from "@/app/utils/file";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Button } from "../Button/Button";
import { TextInput } from "../TextInput/TextInput";

type StackFormProps = {
  stack?: Campaign;
  action: "update" | "create";
};

export default function StackForm({ stack, action }: StackFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
    watch,
  } = useForm({
    resolver: zodResolver(stackSchema),
    defaultValues: {
      id: stack?.id,
      name: stack?.name || "",
      isActive: !!stack?.isActive,
      isVisible: !!stack?.isVisible,
      file: [],
      image: stack?.image || "",
    },
  });
  const file = watch("file")?.[0];

  const previewUrl = !!file ? URL.createObjectURL(file) : stack?.image;

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        let imageUrl = stack?.image;

        if (!!file) imageUrl = await uploadImageToS3Bucket(file);

        if (action === "create") {
          await createStack({
            isActive: data.isActive,
            isVisible: data.isVisible,
            name: data.name,
            image: imageUrl,
          });
        }

        if (action === "update") {
          await editStack({
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
        {stack ? `Edit stack #${stack.id}` : "Create stack"}
      </h1>
      <div className="mb-3">
        <label className="block mb-1">Stack</label>
        <TextInput variant="secondary" {...register("name")} />
        <div className="text-red">{errors.name?.message}</div>
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
        <label className="mr-3">Is visible</label>
        <input
          type="checkbox"
          className="mt-1"
          {...register("isVisible", { value: true })}
        />
        <div className="text-red">{errors.isVisible?.message}</div>
      </div>
      <div className="mb-3">
        <label className="block mb-1">Image</label>
        {!!previewUrl && (
          <div className="w-32 h-32 relative overflow-hidden rounded-full">
            <Image
              fill
              alt="preview-image-stack"
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

        <div className="text-red">{errors.file?.message as string}</div>
      </div>
      <Button variant="primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting" : "Submit"}
      </Button>
    </form>
  );
}
