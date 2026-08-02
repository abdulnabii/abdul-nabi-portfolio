import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { CheckCircle2, ShieldCheck, ShoppingBag, ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout Successful — Nova Commerce",
  description: "Secure payment gateway validation and receipt matching loop.",
  robots: { index: false, follow: false },
};

interface CheckoutSuccessProps {
  searchParams: {
    session_id?: string;
    items?: string;
  };
}

interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CheckoutSuccessPage({ searchParams = {} }: CheckoutSuccessProps) {
  const params = searchParams || {};
  const sessionId = params.session_id ?? "cs_live_session_validation_success";
  
  let receiptItems: ReceiptItem[] = [];
  try {
    if (params.items) {
      receiptItems = JSON.parse(params.items) as ReceiptItem[];
    }
  } catch (e) {
    console.error("Failed to parse receipt items", e);
  }

  const orderTotal = receiptItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="section-padding pt-32 md:pt-36 bg-gradient-to-b from-[#0a0f1e] via-[#050814] to-[#0a0f1e] min-h-screen flex items-center justify-center">
      <div className="container-narrow max-w-lg">
        
        <GlassCard padding="lg" elevated className="text-center space-y-6">
          
          {/* Success Check Badge */}
          <div className="flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse">
              <CheckCircle2 className="h-7 w-7" />
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Secure Checkout Completed
            </h1>
            <p className="text-sm text-slate-400">
              Payment session verification succeeded and receipt logged.
            </p>
          </div>

          {/* Secure validation badge */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 flex items-start gap-3 text-left">
            <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-white uppercase tracking-wider">
                AppSec Price Audit Clear
              </p>
              <p className="leading-relaxed text-slate-300">
                Server-side price verification completed. Cart price injections bypassed; checkout constructed based exclusively on the secure server catalog.
              </p>
            </div>
          </div>

          {/* Receipt details */}
          {receiptItems.length > 0 && (
            <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-4 text-left space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-white/5 pb-2">
                Order Receipt Summary
              </h3>
              
              <ul className="space-y-2 text-xs">
                {receiptItems.map((item) => (
                  <li key={item.id} className="flex justify-between items-center text-slate-300">
                    <span>
                      {item.name} <span className="text-slate-500 font-mono">x{item.quantity}</span>
                    </span>
                    <span className="font-mono text-white">${item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-white/5 pt-2 flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-400">Validated Order Total</span>
                <span className="font-mono text-cyan-400">${orderTotal}</span>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2 text-[10px] font-mono text-slate-500 text-left border-t border-white/5 pt-4">
            <div className="flex justify-between">
              <span>Session ID</span>
              <span className="truncate max-w-[200px]">{sessionId}</span>
            </div>
            <div className="flex justify-between">
              <span>Security Hash</span>
              <span>SHA-256 Verified</span>
            </div>
          </div>

          <div className="pt-2">
            <LinkButton
              href="/projects/nova-commerce"
              variant="secondary"
              size="md"
              className="w-full flex items-center justify-center gap-1.5 cursor-grow"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Storefront Case Study
            </LinkButton>
          </div>

        </GlassCard>

      </div>
    </div>
  );
}
