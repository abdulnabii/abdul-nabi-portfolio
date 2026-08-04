"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

// Mock products database matching Catalog exactly
interface ProductItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  variant: string;
}

const products: ProductItem[] = [
  {
    id: "vanguard-key-case",
    name: "Vanguard Security Key Case",
    price: 29,
    description: "Rugged CNC-milled aluminum casing with active RFID shielding. Scoped for YubiKeys and hardware wallets.",
    image: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=600&q=80",
    variant: "Space Gray / CNC Alloy",
  },
  {
    id: "minimal-desk-grid",
    name: "Minimal Desk Grid (Pad)",
    price: 49,
    description: "Double-woven merino wool desk pad with an integrated alignment grid and magnetic cable routing loops.",
    image: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80",
    variant: "Slate Charcoal / 90x40cm",
  },
  {
    id: "cipher-key-organizer",
    name: "Cipher Leather Key Organizer",
    price: 39,
    description: "Full-grain vegetable-tanned leather organizer holding up to 8 keys with custom tension-locking bolt.",
    image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80",
    variant: "Saddle Tan / Brass Hardware",
  },
];

interface CartStateItem {
  id: string;
  quantity: number;
}

export function NovaCommerceDemo() {
  const [cart, setCart] = useState<CartStateItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tamperingSimulated, setTamperingSimulated] = useState(false);
  const [priceOverride, setPriceOverride] = useState(0); // For simulated price tempering attacks

  // 1. Hydration Safety: delay reading state from localStorage until mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nova_cart_cache");
      if (stored) {
        setCart(JSON.parse(stored) as CartStateItem[]);
      }
    } catch (e) {
      console.warn("localStorage disabled", e);
    }
    setMounted(true);
  }, []);

  // Sync cart shifts back to storage
  function saveCart(newCart: CartStateItem[]) {
    setCart(newCart);
    try {
      localStorage.setItem("nova_cart_cache", JSON.stringify(newCart));
    } catch (e) {
      // Ignored
    }
  }

  function handleAddToCart(id: string) {
    const existing = cart.find((i) => i.id === id);
    let nextCart: CartStateItem[];
    if (existing) {
      nextCart = cart.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      nextCart = [...cart, { id, quantity: 1 }];
    }
    saveCart(nextCart);
    setCartOpen(true);
  }

  function handleUpdateQuantity(id: string, delta: number) {
    const nextCart = cart
      .map((i) => {
        if (i.id === id) {
          const qty = i.quantity + delta;
          return { ...i, quantity: qty };
        }
        return i;
      })
      .filter((i) => i.quantity > 0);
    saveCart(nextCart);
  }

  function handleRemoveItem(id: string) {
    saveCart(cart.filter((i) => i.id !== id));
  }

  // 2. Client-side sums (for visual display only; server will recalculate)
  const cartDetails = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    const items = cart.map((cItem) => {
      const prod = products.find((p) => p.id === cItem.id)!;
      count += cItem.quantity;
      subtotal += prod.price * cItem.quantity;
      return {
        ...prod,
        quantity: cItem.quantity,
      };
    });

    return { items, count, subtotal };
  }, [cart]);

  // 3. Secure Server Checkout Redirect flow
  async function handleCheckout() {
    if (cart.length === 0 || loading) return;
    setLoading(true);

    try {
      // Build cart payload
      // In a real attack, a hacker might try to inject {"price": 1} here.
      // But our endpoint only accepts `{ id, quantity }` and fetches prices server-side.
      const payload = {
        cartItems: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          // Attacker simulation attempt injection:
          ...(tamperingSimulated ? { price: priceOverride } : {}),
        })),
      };

      const res = await fetch("/api/projects/nova-commerce/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to initialize payment session.");
      }

      const data = (await res.json()) as { url: string };
      
      // Empty local cart cache upon redirecting to checkout pipeline
      saveCart([]);
      setCartOpen(false);

      // Redirect user to payment portal (Stripe checkout screen or simulated page)
      window.location.href = data.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Checkout error occurred.");
    } finally {
      setLoading(false);
    }
  }

  // Render a skeleton loading frame during server-side hydration to avoid layout shifts
  if (!mounted) {
    return (
      <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-12 text-center text-slate-500">
        <ShoppingBag className="mx-auto h-8 w-8 animate-pulse text-slate-600 mb-3" />
        <p className="text-xs">Initializing storefront catalog...</p>
      </div>
    );
  }

  function handleResetCart() {
    saveCart([]);
    setTamperingSimulated(false);
    setPriceOverride(0);
  }

  return (
    <div className="relative w-full rounded-3xl border border-white/10 bg-[#050814]/80 p-1 shadow-glass-lg backdrop-blur-2xl overflow-hidden">
      
      {/* Store Header Controls */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4.5 w-4.5 text-accent-soft" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Nova Storefront Sandbox
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetCart}
            className="cursor-grow rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Reset Cart & Simulation"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="cursor-grow flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition"
            aria-label={`Open cart — ${cartDetails.count} item${cartDetails.count !== 1 ? "s" : ""}, $${cartDetails.subtotal}`}
          >
            <ShoppingBag className="h-3.5 w-3.5 text-accent-soft" />
            <span className="font-medium">
              Cart ({cartDetails.count}) · ${cartDetails.subtotal}
            </span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] min-h-[480px]">
        
        {/* Left Column: Product Cards Grid */}
        <div className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <GlassCard key={product.id} padding="none" className="overflow-hidden flex flex-col justify-between">
                <div className="relative h-32 w-full bg-slate-950">
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/80 to-transparent" />
                  <span className="absolute bottom-2 right-2 rounded-lg bg-slate-950/80 px-2 py-0.5 text-xs font-mono text-cyan-400 font-semibold border border-white/5">
                    ${product.price}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h5 className="font-semibold text-sm text-white">{product.name}</h5>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">{product.variant}</p>
                </div>
                <div className="p-4 pt-0">
                  <Button
                    onClick={() => handleAddToCart(product.id)}
                    variant="secondary"
                    size="sm"
                    className="w-full flex items-center justify-center gap-1.5 cursor-grow"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add to Cart
                  </Button>
                </div>
              </GlassCard>
            ))}

            {/* Price Tampering Simulation (AppSec Demo Card) */}
            <GlassCard padding="md" className="border-dashed border-indigo-500/25 bg-indigo-500/[0.02] flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <Lock className="h-4 w-4" />
                  <h5 className="font-semibold text-xs uppercase tracking-wider">Price Override Rig</h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Toggle to simulate a client-side price tampering attack. Send injected values (e.g. price $1) to see the server override the payload.
                </p>
                <div className="flex items-center gap-2 pt-1.5">
                  <input
                    type="checkbox"
                    id="tampering"
                    checked={tamperingSimulated}
                    onChange={(e) => setTamperingSimulated(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent"
                  />
                  <label htmlFor="tampering" className="text-xs text-slate-300 select-none cursor-pointer">
                    Inject tampering fields
                  </label>
                </div>
              </div>
              {tamperingSimulated && (
                <div className="pt-2">
                  <span className="block text-[10px] text-slate-500 mb-1">Injected Price Override</span>
                  <input
                    type="number"
                    value={priceOverride}
                    onChange={(e) => setPriceOverride(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-red-500/20 bg-red-500/5 px-2 py-1 text-xs text-red-300 outline-none font-mono"
                    placeholder="e.g. 1.00"
                  />
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* Right Column: AppSec Telemetry & Cart Detail */}
        <div className="p-4 flex flex-col justify-between bg-white/[0.01] border-l border-white/5">
          <div className="space-y-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
              AppSec Checkout Gate
            </h5>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Stripe Secret Integration</span>
                <Badge variant={process.env.STRIPE_SECRET_KEY ? "accent" : "muted"} className="text-[10px] !py-0">
                  {process.env.STRIPE_SECRET_KEY ? "Live Secret Keys" : "Sandbox Simulator"}
                </Badge>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Price Authoritative Authority</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Server-Only
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Payload Strict Schema</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Active
                </span>
              </div>
            </div>

            {/* Local Tampering Test Log Indicator */}
            {tamperingSimulated ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-[11px] text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold uppercase tracking-wider">Tamper Flag Raised</p>
                  <p className="leading-relaxed">
                    Cart payload will inject `price: ${priceOverride}`. When clicking checkout, watch the server discard it and compute based on official catalog prices.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-400">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold uppercase tracking-wider">Secure Payment Pipes</p>
                  <p className="leading-relaxed">
                    Stripe redirects are generated server-side. Customer metadata is validated before Session Signature signing.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Cart Subtotal</span>
              <span>${cartDetails.subtotal}</span>
            </div>
            <Button
              onClick={() => setCartOpen(true)}
              variant="primary"
              size="md"
              className="w-full flex items-center justify-center gap-1.5 cursor-grow"
              disabled={cart.length === 0}
            >
              <ShoppingBag className="h-4 w-4" />
              Open Shopping Cart ({cartDetails.count})
            </Button>
          </div>
        </div>

      </div>

      {/* Mini-Cart Slide drawer Overlay */}
      {cartOpen && (
        <div className="absolute inset-0 z-40 bg-[#050814]/90 backdrop-blur-md flex flex-col justify-between p-6 animate-fade-in">
          <div className="space-y-4 overflow-y-auto max-h-[360px]">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h5 className="font-semibold text-white flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5 text-accent-soft" />
                Shopping Cart ({cartDetails.count})
              </h5>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {cartDetails.items.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ShoppingBag className="mx-auto h-8 w-8 mb-2 opacity-35" />
                <p className="text-xs">Your cart is currently empty.</p>
              </div>
            ) : (
              <ul className="space-y-3 pr-1">
                {cartDetails.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-12 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-white/10">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <h6 className="font-semibold text-xs text-white">{item.name}</h6>
                        <span className="text-[10px] text-slate-500">${item.price} each</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-white/10 bg-slate-950/50 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="p-1 text-slate-400 hover:text-white transition"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-white font-mono">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="p-1 text-slate-400 hover:text-white transition"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-300 transition p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

          </div>

          <div className="border-t border-white/10 pt-4 space-y-4">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-400">Order Subtotal</span>
              <span className="text-white font-mono">${cartDetails.subtotal}</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setCartOpen(false)}
                className="flex-1 cursor-grow"
              >
                Continue Browsing
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCheckout}
                disabled={cart.length === 0 || loading}
                className="flex-1 flex items-center justify-center gap-1.5 cursor-grow"
              >
                <CreditCard className="h-4 w-4" />
                {loading ? "Verifying..." : "Checkout Order"}
              </Button>
            </div>
            <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
              <Lock className="h-3 w-3 text-cyan-400" />
              Secure payments powered by Stripe Checkout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
