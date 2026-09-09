const { cors, getMachine, setMachine, TRIAL_DAYS } = require('../_lib');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { machineId } = req.body || {};
    if (!machineId) return res.status(400).json({ error: 'machineId مطلوب' });

    const existing = await getMachine(machineId);
    if (existing) {
      if (existing.status === 'licensed') {
        return res.status(200).json({ success: true, message: 'الجهاز مفعّل مسبقاً' });
      }
      if (existing.status === 'trial') {
        return res.status(200).json({ success: true, message: 'التجربة قيد التشغيل بالفعل' });
      }
      if (existing.status === 'expired') {
        return res.status(400).json({ success: false, error: 'انتهت التجربة مسبقاً. استخدم كود تفعيل.' });
      }
    }

    const data = {
      status: 'trial',
      trialStart: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    await setMachine(machineId, data);

    return res.status(200).json({
      success: true,
      message: 'تم بدء التجربة المجانية لمدة ' + TRIAL_DAYS + ' يوم',
      trialDays: TRIAL_DAYS
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message || 'Server error' });
  }
};
