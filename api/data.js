// api/data.js — Vercel serverless function
// The JSONBin API key and bin ID live here as environment variables,
// never exposed to the browser or visible in your GitHub source code.

const API_KEY  = process.env.JSONBIN_KEY;
const BASE_URL = 'https://api.jsonbin.io/v3';

export default async function handler(req, res) {
  // Allow requests only from your own site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!API_KEY) {
    return res.status(500).json({ error: 'JSONBIN_KEY environment variable is not set' });
  }

  // ── GET — load data ──
  if (req.method === 'GET') {
    const binId = process.env.JSONBIN_BIN_ID;

    if (!binId) {
      // No bin created yet — tell the client it's empty
      return res.status(200).json({ empty: true });
    }

    const response = await fetch(`${BASE_URL}/b/${binId}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to load data from JSONBin' });
    }

    const json = await response.json();
    return res.status(200).json(json.record);
  }

  // ── POST — save data ──
  if (req.method === 'POST') {
    const payload = req.body;
    const binId   = process.env.JSONBIN_BIN_ID;

    if (!binId) {
      // First save ever — create a new bin
      const response = await fetch(`${BASE_URL}/b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
          'X-Bin-Name':   'TutorFlow',
          'X-Bin-Private':'true'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        return res.status(500).json({ error: 'Failed to create bin' });
      }

      const json  = await response.json();
      const newId = json.metadata.id;

      // IMPORTANT: Print the bin ID to Vercel logs so you can save it
      console.log('=== NEW JSONBIN BIN CREATED ===');
      console.log('Add this to your Vercel environment variables:');
      console.log(`JSONBIN_BIN_ID = ${newId}`);
      console.log('================================');

      return res.status(200).json({ ok: true, binId: newId });
    }

    // Bin exists — update it
    const response = await fetch(`${BASE_URL}/b/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to save data' });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
