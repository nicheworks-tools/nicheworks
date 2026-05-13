const DEFAULT_ENTITLEMENT = 'nicheworks_pro';

function json(data, status = 200) {
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

async function logAccess(env, data) {
  if (!env.DB) return;
  try {
    await env.DB.prepare(
      `INSERT INTO pro_access_logs (customer_email, entitlement, tool_id, status, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      data.customer_email || null,
      data.entitlement || DEFAULT_ENTITLEMENT,
      data.tool_id || null,
      data.status || 'unknown',
      new Date().toISOString()
    ).run();
  } catch (error) {
    // Access logging must never break status checks.
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id') || '';
  const email = normalizeEmail(url.searchParams.get('email') || '');
  const entitlement = url.searchParams.get('entitlement') || env.PRO_ENTITLEMENT_DEFAULT || DEFAULT_ENTITLEMENT;
  const toolId = url.searchParams.get('tool_id') || url.searchParams.get('tool') || null;

  if (!env.DB) {
    return json({ ok: false, status: 'server_not_configured', message: 'D1 binding DB is not configured.' }, 500);
  }

  try {
    let customerEmail = email;
    let purchase = null;

    if (sessionId) {
      purchase = await env.DB.prepare(
        `SELECT stripe_session_id, customer_email, payment_status, entitlement
         FROM pro_purchases
         WHERE stripe_session_id = ?
         LIMIT 1`
      ).bind(sessionId).first();

      if (!purchase) {
        await logAccess(env, { customer_email: null, entitlement, tool_id: toolId, status: 'not_found' });
        return json({ ok: false, status: 'not_found' }, 404);
      }

      customerEmail = normalizeEmail(purchase.customer_email);
    }

    if (!customerEmail) {
      return json({ ok: false, status: 'missing_identifier', message: 'session_id is required. email fallback is optional and weaker.' }, 400);
    }

    const row = await env.DB.prepare(
      `SELECT customer_email, entitlement, status, updated_at
       FROM pro_entitlements
       WHERE customer_email = ? AND entitlement = ?
       LIMIT 1`
    ).bind(customerEmail, entitlement).first();

    if (!row || row.status !== 'active') {
      await logAccess(env, { customer_email: customerEmail, entitlement, tool_id: toolId, status: row ? row.status : 'not_found' });
      return json({ ok: false, status: row ? row.status : 'not_found', entitlement }, 404);
    }

    await logAccess(env, { customer_email: customerEmail, entitlement, tool_id: toolId, status: 'active' });
    return json({
      ok: true,
      status: 'active',
      entitlement: row.entitlement,
      customer_email: row.customer_email,
      updated_at: row.updated_at
    });
  } catch (error) {
    return json({ ok: false, status: 'server_error', message: 'Could not check Pro status.' }, 500);
  }
}
