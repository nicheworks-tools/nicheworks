// Cloudflare Pages Functions
// GET /api/verify?session_id=cs_...
//
// Verifies Stripe Checkout Session status via Stripe API,
// returns { ok: true } only when paid AND (optionally) matches your Payment Link.
//
// Required env:
// - STRIPE_SECRET_KEY = sk_live_...
// - STRIPE_PAYMENT_LINK_ID = plink_...

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return json({ ok: false, error: "missing_or_invalid_session_id" }, 400);
    }

    if (!env.STRIPE_SECRET_KEY) {
      return json({ ok: false, error: "missing_stripe_secret_key" }, 500);
    }

    if (!env.STRIPE_PAYMENT_LINK_ID) {
      return json({ ok: false, error: "missing_payment_link_id" }, 500);
    }

    // Retrieve Checkout Session
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return json(
        { ok: false, error: "stripe_error", detail: data?.error?.message || "unknown" },
        400,
      );
    }

    // Must be paid
    if (data.payment_status !== "paid") {
      return json({ ok: false, error: "not_paid", payment_status: data.payment_status }, 200);
    }

    // Must be your Payment Link session
    // Stripe Checkout Session may include "payment_link"
    if (data.payment_link !== env.STRIPE_PAYMENT_LINK_ID) {
      return json(
        {
          ok: false,
          error: "payment_link_mismatch",
          payment_link: data.payment_link || null,
        },
        200,
      );
    }

    return json({ ok: true }, 200);
  } catch {
    return json({ ok: false, error: "server_error" }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
