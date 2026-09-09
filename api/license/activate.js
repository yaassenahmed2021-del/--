const { cors, getMachine, setMachine, getKey, setKey } = require('../_lib');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { machineId, licenseKey } = req.body || {};
    if (!machineId || !licenseKey) {
      return res.status(400).json({ success: false, error: 'machineId و licenseKey مطلوبان' });
    }

    const keyData = await getKey(licenseKey.trim());
    if (!keyData || !keyData.valid) {
      return res.status(400).json({ success: false, error: 'كود التفعيل غير صالح' });
    }

    if (keyData.usedBy && keyData.usedBy !== machineId) {
      return res.status(400).json({ success: false, error: 'هذا الكود مستخدم على جهاز آخر' });
    }

    // Mark key used
    keyData.usedBy = machineId;
    keyData.usedAt = new Date().toISOString();
    await setKey(licenseKey.trim(), keyData);

    // License machine
    await setMachine(machineId, {
      status: 'licensed',
      licenseKey: licenseKey.trim().toUpperCase(),
      activatedAt: new Date().toISOString()
    });

    return res.status(200).json({ success: true, message: 'تم تفعيل البرنامج بنجاح على هذا الجهاز' });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message || 'Server error' });
  }
};
