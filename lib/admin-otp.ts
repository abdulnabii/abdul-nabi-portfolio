import crypto from "crypto";

const OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
export const ADMIN_OTP_CHALLENGE_COOKIE = "an_admin_otp_challenge";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("Admin authentication is not configured: SESSION_SECRET is missing or too short.");
  }
  return secret;
}

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAIL || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const allowed = getAdminEmails();
  return allowed.includes(normalized);
}

interface ChallengePayload {
  email: string;
  codeHash: string;
  expiresAt: number;
}

/**
 * Generates a cryptographically secure 6-digit OTP code and a signed challenge token
 */
export function generateAdminOtp(email: string): {
  code: string;
  challengeToken: string;
  expiresAt: number;
} {
  const normalizedEmail = email.trim().toLowerCase();
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + OTP_EXPIRATION_MS;
  const secret = getSecret();

  // Salted HMAC hash of email + code + expiresAt
  const codeHash = crypto
    .createHmac("sha256", secret)
    .update(`${normalizedEmail}:${code}:${expiresAt}`)
    .digest("hex");

  const payload: ChallengePayload = {
    email: normalizedEmail,
    codeHash,
    expiresAt,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("hex");

  const challengeToken = `${payloadB64}.${signature}`;

  return { code, challengeToken, expiresAt };
}

/**
 * Verifies the 6-digit code against the signed challenge token
 */
export function verifyAdminOtp(
  challengeToken: string,
  inputEmail: string,
  inputCode: string
): { valid: boolean; error?: string; email?: string } {
  try {
    const secret = getSecret();
    const [payloadB64, signature] = challengeToken.split(".");
    if (!payloadB64 || !signature) {
      return { valid: false, error: "Invalid challenge token format." };
    }

    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("hex");

    const bufExpectedSig = Buffer.from(expectedSig);
    const bufActualSig = Buffer.from(signature);

    if (
      bufExpectedSig.length !== bufActualSig.length ||
      !crypto.timingSafeEqual(bufExpectedSig, bufActualSig)
    ) {
      return { valid: false, error: "Invalid or tampered security code token." };
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as ChallengePayload;

    if (!payload.email || !payload.codeHash || !payload.expiresAt) {
      return { valid: false, error: "Malformed security challenge payload." };
    }

    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: "Security code has expired. Please request a new code." };
    }

    const normalizedInputEmail = inputEmail.trim().toLowerCase();
    if (payload.email !== normalizedInputEmail) {
      return { valid: false, error: "Email mismatch for this security code." };
    }

    const cleanCode = inputCode.trim();
    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(`${payload.email}:${cleanCode}:${payload.expiresAt}`)
      .digest("hex");

    const bufExpected = Buffer.from(expectedHash, "hex");
    const bufActual = Buffer.from(payload.codeHash, "hex");

    if (
      bufExpected.length !== bufActual.length ||
      !crypto.timingSafeEqual(bufExpected, bufActual)
    ) {
      return { valid: false, error: "Incorrect 6-digit code. Please check and try again." };
    }

    return { valid: true, email: payload.email };
  } catch (err) {
    console.error("[verifyAdminOtp] Error:", err);
    return { valid: false, error: "Security code validation failed." };
  }
}

/**
 * Builds responsive, high-fidelity HTML email template for the OTP code
 */
function buildAdminOtpHtml(code: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Security Code</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #050814; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-height: 100vh; background-color: #050814; padding: 40px 15px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width: 520px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 36px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
            <tr>
              <td align="center">
                <div style="display: inline-block; padding: 8px 16px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 9999px; color: #a5b4fc; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 20px;">
                  Admin Security Verification
                </div>
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 10px 0; letter-spacing: -0.02em;">
                  Your One-Time Login Code
                </h1>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 28px 0;">
                  Use the 6-digit security OTP below to authenticate into the Abdul Nabi Portfolio Admin Operations Console.
                </p>

                <!-- Code Display Box -->
                <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 16px; padding: 22px 10px; margin-bottom: 26px; text-align: center;">
                  <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #38bdf8; display: inline-block; padding-left: 12px;">
                    ${code}
                  </span>
                </div>

                <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 20px 0;">
                  ⏳ This security code is valid for <strong>10 minutes</strong> and can only be used once.<br/>
                  If you did not initiate this request, someone may be attempting to access your dashboard. Your password remains safe.
                </p>

                <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; text-align: center;">
                  <span style="color: #475569; font-size: 11px;">
                    Abdul Nabi Portfolio Admin Security System • Automated Dispatch
                  </span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Sends the 6-digit OTP code to the administrator's email via Brevo Transactional API
 */
export async function sendAdminOtpEmail(
  email: string,
  code: string
): Promise<{ success: boolean; deliveredRealEmail: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  // Always log to server stdout for local dev / fallback recovery
  console.log(`[Admin OTP] Verification code for ${normalizedEmail}: ${code}`);

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[Admin OTP] BREVO_API_KEY not configured. Code logged to console only.");
    return {
      success: true,
      deliveredRealEmail: false,
      error: "Email provider key not configured on server. Code output to server console.",
    };
  }

  // Brevo requires the sender to be the verified account email.
  // In Brevo, nabi28309@gmail.com is the verified account sender.
  // Any email sent with abdulnabi.khaskhely as sender is silently rejected by Brevo.
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL &&
    !process.env.BREVO_SENDER_EMAIL.includes("abdulnabi.khaskhely")
      ? process.env.BREVO_SENDER_EMAIL
      : "nabi28309@gmail.com";
  const senderName = "Portfolio Admin Security";

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: normalizedEmail }],
        subject: `🔐 Admin Security Code: ${code}`,
        htmlContent: buildAdminOtpHtml(code),
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      console.error("[Admin OTP] Brevo API error:", res.status, errorBody);
      return {
        success: false,
        deliveredRealEmail: false,
        error: `Email delivery failed (Brevo ${res.status}): ${errorBody}`,
      };
    }

    return { success: true, deliveredRealEmail: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Admin OTP] Unexpected dispatch exception:", errorMsg);
    return {
      success: false,
      deliveredRealEmail: false,
      error: errorMsg,
    };
  }
}
