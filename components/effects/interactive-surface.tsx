"use client";

import { cn } from "@/lib/utils";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

interface InteractiveSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Soft radial spotlight that follows the pointer */
  spotlight?: boolean;
  /** Subtle CSS 3D tilt toward the pointer */
  tilt?: boolean;
  className?: string;
}

/**
 * Premium pointer-reactive surface: spotlight + optional tilt.
 * No-ops on touch / reduced-motion / small screens.
 */
export function InteractiveSurface({
  children,
  spotlight = true,
  tilt = false,
  className,
  ...props
}: InteractiveSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const enabledRef = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 768px)").matches;
    enabledRef.current = fine && !reduce && wide;
  }, []);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabledRef.current || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;

      ref.current.style.setProperty("--spot-x", `${x}px`);
      ref.current.style.setProperty("--spot-y", `${y}px`);

      if (tilt) {
        const rx = (py - 0.5) * -6;
        const ry = (px - 0.5) * 8;
        ref.current.style.setProperty("--tilt-x", `${rx}deg`);
        ref.current.style.setProperty("--tilt-y", `${ry}deg`);
      }
    },
    [tilt]
  );

  const onEnter = () => {
    if (!enabledRef.current) return;
    setActive(true);
  };

  const onLeave = () => {
    setActive(false);
    if (ref.current) {
      ref.current.style.setProperty("--tilt-x", "0deg");
      ref.current.style.setProperty("--tilt-y", "0deg");
    }
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "relative overflow-hidden cursor-grow",
        tilt && "transform-gpu transition-transform duration-200 ease-out",
        tilt &&
          "[transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))]",
        className
      )}
      {...props}
    >
      {spotlight && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300",
            active && "opacity-100"
          )}
          style={{
            background:
              "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(129,140,248,0.14), transparent 55%)",
          }}
        />
      )}
      <div className="relative z-[2] h-full">{children}</div>
    </div>
  );
}
