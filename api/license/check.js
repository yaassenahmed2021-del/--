const { cors, getMachine, daysBetween, TRIAL_DAYS } = require('../_lib');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { machineId } = req.body || {};
    if (!machineId) return res.status(400).json({ error: 'machineId مطلوب' });

    const record = await getMachine(machineId);
    if (!record) {
      return res.status(200).json({ status: 'none', canTrial: true });
    }

    if (record.status === 'licensed') {
      return res.status(200).json({ status: 'licensed', activatedAt: record.activatedAt });
    }

    if (record.status === 'trial') {
      const used = daysBetween(record.trialStart);
      const daysLeft = Math.max(0, Math.ceil(TRIAL_DAYS - used));
      if (used >= TRIAL_DAYS) {
        record.status = 'expired';
        const { setMachine } = require('../_lib');
        await setMachine(machineId, record);
        return res.status(200).json({ status: 'expired', daysLeft: 0 });
      }
      return res.status(200).json({ status: 'trial', daysLeft, trialStart: record.trialStart });
    }

    if (record.status === 'expired') {
      return res.status(200).json({ status: 'expired', daysLeft: 0 });
    }

    return res.status(200).json({ status: 'none', canTrial: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
};
