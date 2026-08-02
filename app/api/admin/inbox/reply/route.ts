import { getAdminSession } from "@/lib/auth";
import { getAllInboxItems, saveAllInboxItems, InboxItem, MessagePayload } from "@/lib/inbox-store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { to, subject, body: messageBody, inboxItemId } = body;

    if (!to || !subject || !messageBody || !inboxItemId) {
      return NextResponse.json(
        { error: "Missing required reply fields" },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.REPLY_FROM_EMAIL || "abdulnabi.khaskhely@gmail.com";
    let emailDispatched = false;

    // Dispatch via Resend API if API Key is configured
    if (resendKey) {
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `Abdul Nabi <${fromEmail}>`,
            to: [to],
            subject: subject,
            text: messageBody,
          }),
        });

        if (resendRes.ok) {
          emailDispatched = true;
        }
      } catch (err) {
        console.error("Resend dispatch error:", err);
      }
    }

    // Update item in inbox store with reply metadata
    const items = await getAllInboxItems();
    const itemIndex = items.findIndex((i) => i.id === inboxItemId);

    const nowIso = new Date().toISOString();

    if (itemIndex !== -1) {
      const targetItem = items[itemIndex];
      items[itemIndex] = {
        ...targetItem,
        read: true,
        payload: {
          ...targetItem.payload,
          repliedAt: nowIso,
          replySubject: subject,
          replyMessage: messageBody,
        } as MessagePayload,
      };
      await saveAllInboxItems(items);
    }

    return NextResponse.json({
      success: true,
      emailDispatched,
      repliedAt: nowIso,
      message: emailDispatched
        ? "Reply dispatched via email successfully!"
        : "Reply recorded in inbox log.",
    });
  } catch (err) {
    console.error("Inbox reply error:", err);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
