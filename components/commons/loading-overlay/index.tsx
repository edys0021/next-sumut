"use client";

import Image from "next/image";
import { IMAGE_PATHS } from "@/lib/assets";
import { cn } from "@/lib/utils";
import "./index.css";

type LoadingOverlayProps = {
  className?: string;
  label?: string;
  size?: number;
  variant?: "fixed" | "screen";
};

export default function LoadingOverlay({
  className,
  label = "Memuat",
  size = 50,
  variant = "fixed",
}: LoadingOverlayProps) {
  return (
    <div
      aria-label={label}
      aria-live="polite"
      className={cn("loading-overlay", `loading-overlay--${variant}`, className)}
    >
      <Image
        alt=""
        className="loading-overlay__image"
        height={size}
        priority
        src={IMAGE_PATHS.loading}
        unoptimized
        width={size}
      />
    </div>
  );
}
