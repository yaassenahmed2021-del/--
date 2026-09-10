const {
  cors,
  getMachine,
  setMachine,
  getKeyUsage,
  setKeyUsage,
  isKeyInManualList
} = require('../_lib');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { machineId, licenseKey } = req.body || {};
    if (!machineId || !licenseKey) {
      return res.status(400).json({ success: false, error: 'machineId و licenseKey مطلوبان' });
    }

    const key = String(licenseKey).trim().toUpperCase();

    // Must exist in GitHub-managed list
    if (!isKeyInManualList(key)) {
      return res.status(400).json({ success: false, error: 'كود التفعيل غير صالح' });
    }

    // Check if already used on another machine
    const usage = await getKeyUsage(key);
    if (usage && usage.usedBy && usage.usedBy !== machineId) {
      return res.status(400).json({ success: false, error: 'هذا الكود مستخدم على جهاز آخر' });
    }

    // Same machine re-activate is OK
    await setKeyUsage(key, {
      usedBy: machineId,
      usedAt: new Date().toISOString()
    });

    await setMachine(machineId, {
      status: 'licensed',
      licenseKey: key,
      activatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'تم تفعيل البرنامج بنجاح على هذا الجهاز'
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message || 'Server error' });
  }
};
