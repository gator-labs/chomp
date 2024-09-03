import anime from "animejs";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const AnimatedTimer = ({
  id,
  duration = 5000,
}: {
  id: string;
  duration?: number;
}) => {
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (circleRef.current) {
      const totalLength = circleRef.current.getTotalLength();
      circleRef.current.style.strokeDasharray = totalLength.toString();
      circleRef.current.style.strokeDashoffset = "0";

      anime({
        targets: circleRef.current,
        strokeDashoffset: [0, totalLength],
        duration: duration + 1000,
        easing: "easeInOutCubic",
        complete: () => {
          toast.dismiss(id);
        },
      });
    }
  }, [id, duration]);

  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={() => toast.dismiss(id)}
      style={{ cursor: "pointer", overflow: "visible" }}
    >
      <g clipPath="url(#clip0_4256_3955)">
        <g clipPath="url(#clip1_4256_3955)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13 14.4147L16.5353 17.9501C16.7229 18.1377 16.9774 18.2431 17.2427 18.2431C17.508 18.2431 17.7624 18.1377 17.95 17.9501C18.1376 17.7625 18.243 17.508 18.243 17.2427C18.243 16.9774 18.1376 16.723 17.95 16.5354L14.4133 13.0001L17.9493 9.46474C18.0422 9.37185 18.1158 9.26159 18.166 9.14024C18.2163 9.01889 18.2421 8.88884 18.2421 8.7575C18.242 8.62617 18.2161 8.49613 18.1659 8.37481C18.1156 8.25348 18.0419 8.14325 17.949 8.05041C17.8561 7.95756 17.7458 7.88392 17.6245 7.83369C17.5031 7.78346 17.3731 7.75762 17.2417 7.75766C17.1104 7.75769 16.9804 7.78358 16.8591 7.83387C16.7377 7.88416 16.6275 7.95785 16.5347 8.05074L13 11.5861L9.46465 8.05074C9.37245 7.95519 9.26214 7.87895 9.14016 7.82649C9.01818 7.77402 8.88698 7.74638 8.7542 7.74516C8.62142 7.74394 8.48973 7.76918 8.36681 7.81941C8.24389 7.86963 8.1322 7.94383 8.03827 8.03768C7.94433 8.13153 7.87003 8.24314 7.81969 8.36601C7.76935 8.48889 7.74398 8.62055 7.74507 8.75333C7.74617 8.88611 7.77369 9.01734 7.82604 9.13937C7.87839 9.2614 7.95452 9.37178 8.04999 9.46407L11.5867 13.0001L8.05065 16.5361C7.95519 16.6284 7.87906 16.7387 7.82671 16.8608C7.77436 16.9828 7.74683 17.114 7.74574 17.2468C7.74465 17.3796 7.77001 17.5113 7.82035 17.6341C7.87069 17.757 7.945 17.8686 8.03893 17.9625C8.13287 18.0563 8.24456 18.1305 8.36748 18.1807C8.4904 18.231 8.62209 18.2562 8.75487 18.255C8.88764 18.2538 9.01885 18.2261 9.14083 18.1737C9.26281 18.1212 9.37312 18.045 9.46532 17.9494L13 14.4154"
            fill="white"
          />
        </g>
      </g>
      <circle
        ref={circleRef}
        cx="13"
        cy="13"
        r="12"
        fill="none"
        stroke="#CFC5F7"
        strokeWidth="3"
      />
      <defs>
        <clipPath id="clip0_4256_3955">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(5 5)"
          />
        </clipPath>
        <clipPath id="clip1_4256_3955">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(5 5)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default AnimatedTimer;
