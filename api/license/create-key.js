const { cors, setKey, ADMIN_SECRET } = require('../_lib');

function randomKey() {
  const part = () => Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  return `KAF-${part()}-${part()}-${part()}`;
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const secret = req.headers['x-admin-secret'] || (req.body && req.body.adminSecret);
    if (secret !== ADMIN_SECRET) {
      return res.status(403).json({ error: 'غير مصرح' });
    }

    const count = Math.min(Number((req.body && req.body.count) || 1), 50);
    const keys = [];
    for (let i = 0; i < count; i++) {
      const key = randomKey();
      await setKey(key, {
        valid: true,
        createdAt: new Date().toISOString(),
        usedBy: null,
        usedAt: null
      });
      keys.push(key);
    }

    return res.status(200).json({ success: true, keys });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
};
