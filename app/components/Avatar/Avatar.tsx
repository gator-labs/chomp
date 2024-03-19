import Image from "next/image";

type AvatarProps = {
  src: string;
  size: "small" | "medium" | "large";
};

export function Avatar({ src, size }: AvatarProps) {
  const resolveDimensions = () => {
    switch (size) {
      case "small":
        return 24;
      case "medium":
        return 40;
      case "large":
        return 64;
      default:
        return 0;
    }
  };

  return (
    <Image
      src={src}
      alt="Avatar"
      width={resolveDimensions()}
      height={resolveDimensions()}
      className="rounded-full border-2 border-white"
    />
  );
}
