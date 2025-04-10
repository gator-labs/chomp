import { IconProps } from ".";

function QuestionIcon({ width = 38, height = 38 }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.9 20.7173C9.80858 21.6964 12.0041 21.9616 14.0909 21.4651C16.1777 20.9686 18.0186 19.7432 19.2818 18.0095C20.545 16.2759 21.1474 14.148 20.9806 12.0095C20.8137 9.87094 19.8886 7.8623 18.3718 6.34552C16.855 4.82875 14.8464 3.90358 12.7078 3.73675C10.5693 3.56991 8.44147 4.17238 6.70782 5.43558C4.97417 6.69878 3.74869 8.53964 3.25222 10.6264C2.75575 12.7132 3.02094 14.9088 4 16.8173L2 22.7173L7.9 20.7173Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.08997 9.71737C9.32507 9.04903 9.78912 8.48547 10.3999 8.1265C11.0107 7.76753 11.7289 7.6363 12.4271 7.75608C13.1254 7.87585 13.7588 8.23889 14.215 8.78089C14.6713 9.3229 14.921 10.0089 14.92 10.7174C14.92 12.7174 11.92 13.7174 11.92 13.7174"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 17.7173H12.01"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default QuestionIcon;
