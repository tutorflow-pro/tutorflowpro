// api/data.js — Vercel serverless function (Supabase)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase environment variables are not set' });
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  // ── GET — load all data ──
  if (req.method === 'GET') {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/tutorflow?id=eq.main&select=students,lessons`,
        { headers }
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Supabase GET failed: ${response.status} — ${text}`);
      }
      const rows = await response.json();
      if (!rows || rows.length === 0) {
        return res.status(200).json({ students: [], lessons: [] });
      }
      return res.status(200).json(rows[0]);
    } catch (e) {
      console.error('GET error:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  // ── POST — save all data ──
  if (req.method === 'POST') {
    try {
      const { students, lessons } = req.body;
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/tutorflow?id=eq.main`,
        {
          method: 'PATCH',
          headers: {
            ...headers,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ students, lessons, updated_at: new Date().toISOString() })
        }
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Supabase PATCH failed: ${response.status} — ${text}`);
      }
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('POST error:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
