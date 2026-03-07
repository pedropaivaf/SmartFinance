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
  const url = new URL(req.url);
  const accountId = url.searchParams.get('accountId');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  if (!accountId) {
    return new Response(JSON.stringify({ error: 'accountId required' }), { status: 400 });
  }

  try {
    const apiKey = await getApiKey();

    let apiUrl = `${BASE_URL}/transactions?accountId=${accountId}&pageSize=500`;
    if (from) apiUrl += `&from=${from}`;
    if (to) apiUrl += `&to=${to}`;

    const response = await fetch(apiUrl, {
      headers: { 'X-API-KEY': apiKey },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Transactions fetch failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data.results ?? []), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const config = { path: '/api/pluggy/transactions' };
