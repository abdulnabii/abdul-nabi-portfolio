import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent/90 text-white border border-accent/40 shadow-glow-sm hover:bg-accent hover:border-accent/60 hover:-translate-y-0.5 hover:shadow-glow",
  secondary:
    "glass text-white border border-white/10 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 hover:shadow-glass",
  ghost:
    "bg-transparent text-slate-300 border border-transparent hover:bg-white/5 hover:border-white/10 hover:text-white hover:-translate-y-0.5",
  icon:
    "glass text-white border border-white/10 hover:bg-white/10 hover:border-white/25 aspect-square !px-0 hover:-translate-y-0.5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-xs rounded-xl",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-2xl",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium",
        "transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050814]",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface LinkButtonProps {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  external?: boolean;
  onClick?: () => void;
}

export function LinkButton({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  external = false,
  onClick,
}: LinkButtonProps) {
  const combinedClassName = cn(
    "inline-flex items-center justify-center gap-2 font-medium",
    "transition-all duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050814]",
    "active:scale-[0.98]",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (external) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={combinedClassName}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={combinedClassName}>
      {children}
    </Link>
  );
}

