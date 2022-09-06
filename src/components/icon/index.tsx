import React, { ImgHTMLAttributes } from "react";

export interface IconProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
}

function Icon({ src, className = "", ...others }: IconProps) {
  return <img src={src} {...others} className={className} />;
}

export default Icon;
