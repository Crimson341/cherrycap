"use client";

// @ts-ignore
import { svgMap } from "lineicons/src/svg-map.js";

interface LineIconProps {
  name: string;
  type?: "regular";
  className?: string;
  size?: number;
}

export function LineIcon({ name, type = "regular", className = "", size = 24 }: LineIconProps) {
  const svgContent = svgMap[type]?.[name];

  if (!svgContent) {
    console.warn(`LineIcon: "${name}" not found`);
    return null;
  }

  // Replace fill colors with currentColor to inherit text color
  const colorizedSvg = svgContent
    .replace(/fill="[^"]*"/g, 'fill="currentColor"')
    .replace(/width="24"/g, `width="${size}"`)
    .replace(/height="24"/g, `height="${size}"`);

  return (
    <span 
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: colorizedSvg }} 
    />
  );
}
