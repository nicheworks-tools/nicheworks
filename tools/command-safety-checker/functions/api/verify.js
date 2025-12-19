// Cloudflare Pages Functions
// GET /api/verify?session_id=cs_test_...
//
// Verifies Stripe Checkout Session status via Stripe API,
// then returns { ok: true } when paid.
// NOTE: Requires env STRIPE_SECRET_KEY

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return json({ ok: false, error: "missing_or_invalid_session_id" }, 400);
    }

    if (!env.STRIPE_SECRET_KEY) {
      return json({ ok: false, error: "server_not_configured" }, 500);
    }

    // Retrieve Checkout Session
    // https://docs.stripe.com/api/checkout/sessions/retrieve
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return json({ ok: false, error: "stripe_error", detail: data?.error?.message || "unknown" }, 400);
    }

    // Stripe fields: payment_status: "paid" | "unpaid" | "no_payment_required"
    // We only unlock when paid.
    if (data.payment_status !== "paid") {
      return json({ ok: false, error: "not_paid", payment_status: data.payment_status }, 200);
    }

    // Optional: also confirm it came from Payment Link
    // (Payment Links sessions generally include payment_link id)
    // if (!data.payment_link) { ... }  // keep loose for MVP

    return json({ ok: true }, 200);
  } catch (e) {
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
