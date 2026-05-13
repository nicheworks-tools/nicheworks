const DEFAULT_ENTITLEMENT = 'nicheworks_pro';

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function parseSignature(header) {
  const out = { timestamp: '', signatures: [] };
  String(header || '').split(',').forEach((part) => {
    const [key, value] = part.trim().split('=');
    if (key === 't') out.timestamp = value || '';
    if (key === 'v1' && value) out.signatures.push(value);
  });
  return out;
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function sign(secret, payload) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(payload)));
}

async function verify(rawBody, header, secret) {
  const parsed = parseSignature(header);
  if (!parsed.timestamp || !parsed.signatures.length || !secret) return false;
  const expected = await sign(secret, `${parsed.timestamp}.${rawBody}`);
  return parsed.signatures.some((item) => constantTimeEqual(item, expected));
}

function checkoutEmail(session) {
  return normalizeEmail(session?.customer_details?.email || session?.customer_email || '');
}

function checkoutSource(session) {
  return String(session?.client_reference_id || session?.metadata?.source_tool || session?.metadata?.tool_id || 'unknown');
}

async function handleCheckoutCompleted(env, event) {
  const session = event.data?.object || {};
  const now = new Date().toISOString();
  const email = checkoutEmail(session);
  const entitlement = session?.metadata?.entitlement || env.PRO_ENTITLEMENT_DEFAULT || DEFAULT_ENTITLEMENT;
  const sessionId = String(session?.id || '');
  const paymentStatus = String(session?.payment_status || 'unknown');

  if (!sessionId) throw new Error('Missing checkout session id');

  await env.DB.prepare(
    `INSERT INTO pro_purchases (
      stripe_session_id, stripe_event_id, customer_id, customer_email, payment_status,
      entitlement, source_tool, payment_link_id, price_id, amount_total, currency,
      raw_created, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(stripe_session_id) DO UPDATE SET
      stripe_event_id=excluded.stripe_event_id,
      customer_id=excluded.customer_id,
      customer_email=excluded.customer_email,
      payment_status=excluded.payment_status,
      entitlement=excluded.entitlement,
      source_tool=excluded.source_tool,
      payment_link_id=excluded.payment_link_id,
      amount_total=excluded.amount_total,
      currency=excluded.currency,
      raw_created=excluded.raw_created,
      updated_at=excluded.updated_at`
  ).bind(
    sessionId,
    event.id,
    session.customer || null,
    email || null,
    paymentStatus,
    entitlement,
    checkoutSource(session),
    session.payment_link || null,
    session.metadata?.price_id || null,
    Number.isFinite(session.amount_total) ? session.amount_total : null,
    session.currency || null,
    Number.isFinite(session.created) ? session.created : null,
    now,
    now
  ).run();

  if (paymentStatus === 'paid' && email) {
    await env.DB.prepare(
      `INSERT INTO pro_entitlements (customer_email, entitlement, status, source, stripe_session_id, created_at, updated_at)
       VALUES (?, ?, 'active', 'stripe_checkout', ?, ?, ?)
       ON CONFLICT(customer_email, entitlement) DO UPDATE SET
         status='active', source='stripe_checkout', stripe_session_id=excluded.stripe_session_id, updated_at=excluded.updated_at`
    ).bind(email, entitlement, sessionId, now, now).run();
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return response({ ok: false, error: 'DB binding missing' }, 500);
  if (!env.STRIPE_WEBHOOK_SECRET) return response({ ok: false, error: 'Webhook secret missing' }, 500);

  const rawBody = await request.text();
  const verified = await verify(rawBody, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!verified) return response({ ok: false, error: 'bad_signature' }, 400);

  let event;
  try { event = JSON.parse(rawBody); } catch (error) { return response({ ok: false, error: 'bad_json' }, 400); }
  if (!event?.id || !event?.type) return response({ ok: false, error: 'bad_event' }, 400);

  const existing = await env.DB.prepare('SELECT event_id FROM stripe_events WHERE event_id = ? LIMIT 1').bind(event.id).first();
  if (existing) return response({ ok: true, duplicate: true });

  if (event.type === 'checkout.session.completed') await handleCheckoutCompleted(env, event);

  await env.DB.prepare('INSERT OR IGNORE INTO stripe_events (event_id, event_type, processed_at) VALUES (?, ?, ?)')
    .bind(event.id, event.type, new Date().toISOString())
    .run();

  return response({ ok: true, event_type: event.type });
}

export async function onRequestGet() {
  return response({ ok: true, endpoint: 'nicheworks_pro_webhook', method: 'POST' });
}
