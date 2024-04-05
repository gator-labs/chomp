import Image from "next/image";
import { GraphicsProps } from ".";
import chompGraphicImage from "../../../public/images/chomp-graphic.png";

export function ChompGraphic({
  width = 115,
  height = 146,
  className,
}: GraphicsProps) {
  return (
    <Image
      src={chompGraphicImage.src}
      width={width}
      height={height}
      className={className}
      alt="Chomp graphic"
    />
  );
}
