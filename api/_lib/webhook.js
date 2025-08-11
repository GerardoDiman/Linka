export async function sendWebhook(event, data = {}) {
  const url = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url) return { ok: false, skipped: true, reason: 'N8N_WEBHOOK_URL not set' };

  const payload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    secret,
    environment: process.env.NODE_ENV || 'production',
    source: 'linka-vercel'
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(secret ? { 'X-API-Key': secret } : {}) },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, body: text };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}


