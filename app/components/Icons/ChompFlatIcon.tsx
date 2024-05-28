import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function ChompFlatIcon({
  fill = "none",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 37 15"
    >
      <path
        fill={fill}
        d="M3.51 3.69h1.75V1.942h1.75V.194h7.05l.002.002a.011.011 0 01.003.008v1.732h3.478V.193h3.537v1.746h1.748v5.259c.081.014 4.988.02 5.268.007V5.463h3.519v1.742h1.75V5.462h3.513v8.78H0V8.978h1.744V5.46H3.51V3.69zm17.552 1.783h-1.748V3.722c0-.003-.002-.006-.003-.008l-.003-.003h-1.74c-.015.395-.008 3.413.006 3.493h3.489V5.472h-.001zM10.551 3.71v3.494h3.494V5.478H12.31c-.043-.026-.031-.062-.031-.094V3.711L10.55 3.71zm19.32 5.267v1.746c.306.012 1.649.007 1.724-.006v-1.74H29.87zm3.516 0v1.746c.31.012 1.65.007 1.725-.006v-1.74h-1.725z"
      ></path>
    </svg>
  );
}
