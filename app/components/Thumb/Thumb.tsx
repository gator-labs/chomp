interface Props {
  className?: string;
}
const Thumb = ({ className = "" }: Props) => {
  return (
    <svg
      width="19"
      height="22"
      viewBox="0 0 19 22"
      fill="none"
      className={className}
    >
      <rect width="19" height="21.7143" rx="5.42857" fill="white" />
      <path
        d="M5.88086 7.23804L5.88086 14.4761M13.119 7.23804L13.119 14.4761"
        stroke="#999999"
        strokeWidth="1.80952"
      />
    </svg>
  );
};

export default Thumb;
