import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  size?: "nav" | "hero" | "auth";
  className?: string;
};

const sizes = {
  nav: { width: 168, height: 168, className: "h-14 w-14 sm:h-16 sm:w-16" },
  hero: { width: 280, height: 280, className: "h-40 w-40 sm:h-52 sm:w-52" },
  auth: { width: 200, height: 200, className: "h-28 w-28" },
};

export function BrandLogo({
  href = "/",
  size = "nav",
  className,
}: BrandLogoProps) {
  const config = sizes[size];
  const image = (
    <Image
      src="/logo-web.png"
      alt="GBP Auto Ranker"
      width={config.width}
      height={config.height}
      className={cn("object-contain", config.className)}
      priority
    />
  );

  if (!href) {
    return <div className={className}>{image}</div>;
  }

  return (
    <Link href={href} className={cn("inline-flex items-center", className)}>
      {image}
      <span className="sr-only">GBP Auto Ranker</span>
    </Link>
  );
}
