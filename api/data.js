// api/data.js — Vercel serverless function (CommonJS)

const API_KEY  = process.env.JSONBIN_KEY;
const BIN_ID   = process.env.JSONBIN_BIN_ID;
const BASE_URL = 'https://api.jsonbin.io/v3';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!API_KEY) {
    return res.status(500).json({ error: 'JSONBIN_KEY is not set in Vercel environment variables' });
  }

  // Send both header variants to cover all JSONBin key types
  const authHeaders = {
    'X-Master-Key': API_KEY,
    'X-Access-Key': API_KEY
  };

  // ── GET — load all data ──
  if (req.method === 'GET') {
    if (!BIN_ID) {
      return res.status(200).json({ empty: true });
    }
    try {
      const response = await fetch(`${BASE_URL}/b/${BIN_ID}/latest`, {
        headers: authHeaders
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('GET failed:', response.status, text);
        throw new Error(`JSONBin GET failed: ${response.status} — ${text}`);
      }
      const json = await response.json();
      return res.status(200).json(json.record);
    } catch (e) {
      console.error('GET error:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  // ── POST — save all data ──
  if (req.method === 'POST') {
    if (!BIN_ID) {
      return res.status(500).json({ error: 'JSONBIN_BIN_ID is not set in Vercel environment variables' });
    }
    try {
      const response = await fetch(`${BASE_URL}/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(req.body)
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('PUT failed:', response.status, text);
        throw new Error(`JSONBin PUT failed: ${response.status} — ${text}`);
      }
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('POST error:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
