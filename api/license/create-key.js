const { cors, ADMIN_SECRET } = require('../_lib');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  return res.status(200).json({
    success: false,
    error: 'إنشاء الأكواد يتم يدوياً عبر تعديل الملف data/license-keys.json على GitHub ثم عمل push'
  });
};
