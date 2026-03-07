const BASE_URL = 'https://api.pluggy.ai';

let cachedApiKey = null;
let cacheExpiry = 0;

async function getApiKey() {
  if (cachedApiKey && Date.now() < cacheExpiry) return cachedApiKey;

  const res = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pluggy auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedApiKey = data.apiKey;
  cacheExpiry = Date.now() + 25 * 60 * 1000;
  return cachedApiKey;
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  if (!process.env.PLUGGY_CLIENT_ID || !process.env.PLUGGY_CLIENT_SECRET) {
    return new Response(JSON.stringify({ error: 'Pluggy credentials not configured' }), { status: 503 });
  }

  try {
    const apiKey = await getApiKey();

    const response = await fetch(`${BASE_URL}/connect_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Connect token failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify({ connectToken: data.accessToken }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const config = { path: '/api/pluggy/connect-token' };
