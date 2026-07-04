// Cloudflare Pages Function — Secure Proxy for n8n Webhook
// This runs server-side on Cloudflare's edge, keeping the real n8n URL hidden from the browser.

const N8N_WEBHOOK_URL = 'https://developsarth.app.n8n.cloud/webhook/chatbot';

export async function onRequestPost(context) {
  try {
    const body = await context.request.text();

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    const responseText = await response.text();

    return new Response(responseText, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy error: ' + err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Handle CORS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
