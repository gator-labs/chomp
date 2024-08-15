import gsap from "gsap";
import { useEffect, useRef } from "react";

type Props = {
  text: string;
};

const Marquee = ({ text }: Props) => {
  const firstText = useRef(null);
  const secondText = useRef(null);
  let xPercent = 0;
  let direction = -1;

  useEffect(() => {
    requestAnimationFrame(animate);
  }, []);

  const animate = () => {
    if (xPercent < -100) {
      xPercent = 0;
    } else if (xPercent > 0) {
      xPercent = -100;
    }
    if (!!firstText.current && !!secondText.current) {
      gsap.set(firstText.current, { xPercent: xPercent });
      gsap.set(secondText.current, { xPercent: xPercent });
      requestAnimationFrame(animate);
      xPercent += 0.2 * direction;
    }
  };

  return (
    <div className="overflow-hidden flex">
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
