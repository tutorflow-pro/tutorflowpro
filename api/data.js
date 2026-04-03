// api/data.js — Vercel serverless function (CommonJS)
// JSONBIN_KEY and JSONBIN_BIN_ID are set in Vercel environment variables.
// They are never visible in your GitHub source code or the browser.

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

  // ── GET — load all data ──
  if (req.method === 'GET') {
    if (!BIN_ID) {
      return res.status(200).json({ empty: true });
    }
    try {
      const response = await fetch(`${BASE_URL}/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      if (!response.ok) throw new Error(`JSONBin GET failed: ${response.status}`);
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
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify(req.body)
      });
      if (!response.ok) throw new Error(`JSONBin PUT failed: ${response.status}`);
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('POST error:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
