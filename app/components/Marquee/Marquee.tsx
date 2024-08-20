import gsap from "gsap";
import { useEffect, useRef } from "react";

type Props = {
  text: string;
};

const Marquee = ({ text }: Props) => {
  const firstText = useRef<HTMLParagraphElement>(null);
  const secondText = useRef<HTMLParagraphElement>(null);
  const container = useRef<HTMLDivElement>(null);
  let xPercent = 0;
  let speed = 0.2;
  let textWidth = 0;

  useEffect(() => {
    if (firstText.current && container.current) {
      textWidth = firstText.current.getBoundingClientRect().width;
      const containerWidth = container.current.getBoundingClientRect().width;
      const relativeSpeed = textWidth / containerWidth;
      speed = speed / relativeSpeed;
      requestAnimationFrame(animate);
    }
  }, []);

  const animate = () => {
    if (xPercent <= -100) {
      xPercent = 0;
    }
    if (!!firstText.current && !!secondText.current) {
      gsap.set(firstText.current, { xPercent });
      gsap.set(secondText.current, { xPercent });
      xPercent -= speed;
      requestAnimationFrame(animate);
    }
  };

  return (
    <div ref={container} className="overflow-hidden flex">
      <div className="whitespace-nowrap relative">
        <p
          ref={firstText}
          className="text-[20px] leading-6 pr-5 whitespace-nowrap"
        >
          {text}
        </p>
        <p
          ref={secondText}
          className="text-[20px] leading-6 pr-5 whitespace-nowrap absolute left-full top-0"
        >
          {text}
        </p>
      </div>
    </div>
  );
};

export default Marquee;
