declare module "*.svg" {
  import { StaticImageData } from "next/image";
  const content: StaticImageData;
  export default content;
}
