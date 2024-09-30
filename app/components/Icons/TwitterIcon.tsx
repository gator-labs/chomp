import React from "react";
import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function TwitterIcon({
    fill = "#0D0D0D",
    width = ICON_DEFAULT_WIDTH_HEIGHT,
    height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.27271 6.66213L16.1167 18.5083H17.7273L7.88332 6.66213H6.27271ZM5.22005 7.14949C4.69101 6.51284 5.17573 5.58521 6.03745 5.58521H7.93959C8.25915 5.58521 8.5608 5.72329 8.75699 5.95939L18.7799 18.0209C19.309 18.6576 18.8243 19.5852 17.9625 19.5852H16.0604C15.7409 19.5852 15.4392 19.4471 15.243 19.211L5.22005 7.14949Z" fill={fill} />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18.7986 5.72122C18.5509 5.52365 18.1717 5.54367 17.9515 5.76594L5.15156 18.689C4.93141 18.9113 4.95372 19.2516 5.20139 19.4492C5.44906 19.6468 5.8283 19.6267 6.04845 19.4045L18.8484 6.48141C19.0686 6.25914 19.0463 5.91879 18.7986 5.72122Z" fill={fill} />
        </svg>
    );
}
