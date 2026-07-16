import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id ?? props.name;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "glass-input min-h-[140px] resize-y",
          error && "border-red-400/50 focus:border-red-400/60 focus:ring-red-400/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
