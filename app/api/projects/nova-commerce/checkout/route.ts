import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface Product {
  id: string;
  name: string;
  price: number;
}

const catalog: Record<string, Product> = {
  "vanguard-key-case": {
    id: "vanguard-key-case",
    name: "Vanguard Security Key Case",
    price: 29,
  },
  "minimal-desk-grid": {
    id: "minimal-desk-grid",
    name: "Minimal Desk Grid (Pad)",
    price: 49,
  },
  "cipher-key-organizer": {
    id: "cipher-key-organizer",
    name: "Cipher Leather Key Organizer",
    price: 39,
  },
};

interface CartItem {
  id: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      cartItems?: CartItem[];
    };

    const cartItems = body.cartItems;

    // 1. AppSec Input & Integrity Validation
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart payload is empty or invalid." }, { status: 400 });
    }

    const validatedLineItems: { id: string; name: string; price: number; quantity: number }[] = [];

    for (const item of cartItems) {
      // Prevent Prototype Pollution / Parameter Tampering
      if (!item || typeof item.id !== "string" || typeof item.quantity !== "number") {
        return NextResponse.json({ error: "Invalid line item schema detected." }, { status: 400 });
      }

      const product = catalog[item.id];
      if (!product) {
        return NextResponse.json({ error: `Product reference '${item.id}' not found in catalog.` }, { status: 404 });
      }

      // Quantity bounds check (avoid negative numbers or overflow quantities)
      const quantity = Math.floor(item.quantity);
      if (quantity <= 0 || quantity > 99) {
        return NextResponse.json({ error: "Invalid product quantity range (1-99)." }, { status: 400 });
      }

      validatedLineItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    // 2. Stripe integration or secure mock fallback
    if (stripeKey) {
      // Build Stripe checkout session line items
      const line_items = validatedLineItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Stripe expects cents
        },
        quantity: item.quantity,
      }));

      // Call Stripe API securely from backend
      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          mode: "payment",
          success_url: `${siteUrl}/projects/nova-commerce/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${siteUrl}/projects/nova-commerce`,
          // Add line items using array query parameter mapping
          ...line_items.reduce((acc, item, index) => {
            acc[`line_items[${index}][price_data][currency]`] = "usd";
            acc[`line_items[${index}][price_data][product_data][name]`] = item.price_data.product_data.name;
            acc[`line_items[${index}][price_data][unit_amount]`] = item.price_data.unit_amount.toString();
            acc[`line_items[${index}][quantity]`] = item.quantity.toString();
            return acc;
          }, {} as Record<string, string>),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Stripe API Session Error:", errorText);
        return NextResponse.json({ error: "Failed to create secure Stripe session." }, { status: 502 });
      }

      const session = (await response.json()) as { url: string };
      return NextResponse.json({ url: session.url });
    } else {
      // Mock Sandbox Checkout Pipeline (highly realistic telemetry output)
      const mockSessionId = `mock_session_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
      const successRedirectUrl = `/projects/nova-commerce/checkout-success?session_id=${mockSessionId}&items=${encodeURIComponent(
        JSON.stringify(
          validatedLineItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }))
        )
      )}`;

      return NextResponse.json({ url: successRedirectUrl });
    }
  } catch (err) {
    console.error("[Nova Commerce Checkout API Error]:", err);
    return NextResponse.json({ error: "Internal payment processing gate failure." }, { status: 500 });
  }
}
