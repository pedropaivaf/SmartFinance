/**
 * Pluggy Open Finance Proxy Server
 *
 * This Express server handles authentication with Pluggy API so that
 * clientId/clientSecret never reach the frontend bundle.
 *
 * Endpoints:
 *   POST /api/pluggy/connect-token  → returns { connectToken }
 *   GET  /api/pluggy/accounts/:itemId → returns accounts[]
 *   GET  /api/pluggy/transactions/:accountId → returns transactions[]
 *
 * Environment variables (.env or .env.local):
 *   PLUGGY_CLIENT_ID
 *   PLUGGY_CLIENT_SECRET
 *   PLUGGY_ENV=sandbox          (sandbox | production)
 *   PORT=3001                   (optional)
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

const {
  PLUGGY_CLIENT_ID,
  PLUGGY_CLIENT_SECRET,
  PLUGGY_ENV = 'sandbox',
  PORT = 3001,
} = process.env;

const BASE_URL = PLUGGY_ENV === 'production'
  ? 'https://api.pluggy.ai'
  : 'https://api.pluggy.ai'; // Pluggy uses same URL, sandbox is controlled by API key type

// ── Helper: get API key (short-lived, cached 30 min) ────────────────────

let cachedApiKey = null;
let cacheExpiry = 0;

async function getApiKey() {
  if (cachedApiKey && Date.now() < cacheExpiry) return cachedApiKey;

  const res = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: PLUGGY_CLIENT_ID, clientSecret: PLUGGY_CLIENT_SECRET }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pluggy auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedApiKey = data.apiKey;
  cacheExpiry = Date.now() + 25 * 60 * 1000; // 25 min (token valid 30 min)
  return cachedApiKey;
}

// ── Routes ──────────────────────────────────────────────────────────────

app.post('/api/pluggy/connect-token', async (_req, res) => {
  try {
    if (!PLUGGY_CLIENT_ID || !PLUGGY_CLIENT_SECRET) {
      return res.status(503).json({ error: 'Pluggy credentials not configured' });
    }
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
    res.json({ connectToken: data.accessToken });
  } catch (err) {
    console.error('POST /connect-token error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pluggy/accounts/:itemId', async (req, res) => {
  try {
    const apiKey = await getApiKey();
    const response = await fetch(`${BASE_URL}/accounts?itemId=${req.params.itemId}`, {
      headers: { 'X-API-KEY': apiKey },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Accounts fetch failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    res.json(data.results ?? []);
  } catch (err) {
    console.error('GET /accounts error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pluggy/transactions/:accountId', async (req, res) => {
  try {
    const apiKey = await getApiKey();
    const { from, to } = req.query;
    let url = `${BASE_URL}/transactions?accountId=${req.params.accountId}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;

    const response = await fetch(url, {
      headers: { 'X-API-KEY': apiKey },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Transactions fetch failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    res.json(data.results ?? []);
  } catch (err) {
    console.error('GET /transactions error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ────────────────────────────────────────────────────────

app.get('/api/pluggy/health', (_req, res) => {
  res.json({
    status: 'ok',
    configured: !!(PLUGGY_CLIENT_ID && PLUGGY_CLIENT_SECRET),
    env: PLUGGY_ENV,
  });
});

// ── Start ───────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Pluggy proxy running on http://localhost:${PORT}`);
  console.log(`Environment: ${PLUGGY_ENV}`);
  console.log(`Credentials configured: ${!!(PLUGGY_CLIENT_ID && PLUGGY_CLIENT_SECRET)}`);
});
