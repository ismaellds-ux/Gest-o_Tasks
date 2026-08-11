import Image from "next/image";
import touro from "@/assets/brand/touro.png";

interface LogoProps {
  size?: number;
  variant?: "row" | "stacked";
}

export function Logo({ size = 28, variant = "row" }: LogoProps) {
  const wrapperClass = variant === "stacked" ? "flex flex-col items-center gap-2" : "flex items-center gap-2";
  const textClass =
    variant === "stacked"
      ? "font-display text-xl font-bold tracking-wide text-fg"
      : "font-display text-lg font-bold tracking-wide text-fg";

  return (
    <div className={wrapperClass}>
      <Image src={touro} alt="" width={size} height={size} priority className="shrink-0" />
      <span className={textClass}>TASKS</span>
    </div>
  );
}
