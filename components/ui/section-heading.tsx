import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  eyebrow?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  className,
  eyebrow,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16 max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent-soft">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          "mt-6 h-px w-16 bg-gradient-to-r from-accent via-accent-cyan/60 to-transparent",
          align === "center" && "mx-auto"
        )}
      />
    </div>
  );
}
