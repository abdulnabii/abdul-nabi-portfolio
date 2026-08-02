import { LinkButton } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center section-padding relative overflow-hidden bg-gradient-to-b from-[#0a0f1e] via-[#050814] to-[#0a0f1e]">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="container-narrow relative z-10 text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-glass">
          <Logo className="h-10 w-10 shrink-0" />
        </div>

        <span className="font-mono text-sm font-semibold tracking-widest text-indigo-400 uppercase">
          404 Error
        </span>

        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Page Not Found
        </h1>

        <p className="mt-4 text-base text-slate-400 leading-relaxed">
          The page or case study you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <LinkButton href="/" variant="primary" size="md" className="w-full sm:w-auto">
            <Home className="h-4 w-4" />
            Back to home
          </LinkButton>
          <LinkButton href="/#projects" variant="secondary" size="md" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />
            View selected work
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
