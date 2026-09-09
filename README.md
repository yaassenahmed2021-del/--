# KAFIRA License Server (Vercel + KV)

## النشر على Vercel

1. ارفع مجلد `server` كمشروع Vercel (أو اربطه من GitHub)
2. من Vercel Dashboard → Storage → أنشئ **KV** واربطه بالمشروع
3. أضف Environment Variable:
   - `ADMIN_SECRET` = كلمة سر قوية لإنشاء أكواد التفعيل
4. Deploy

بعد النشر انسخ رابط المشروع مثل:
`https://kafira-license.vercel.app`

وفي ملف `activation.html` داخل البرنامج عدّل:
```js
const API_BASE = 'https://your-project.vercel.app';
```

## إنشاء كود تفعيل بعد البيع

```bash
curl -X POST https://your-project.vercel.app/api/license/create-key \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" \
  -d "{\"count\":1}"
```

سيُرجع كوداً مثل: `KAF-AB12-CD34-EF56`

أعطِ هذا الكود للمشتري ليُدخله في شاشة التفعيل.

## الحالات المخزنة في KV

- `machine:{id}` → `{ status: trial|licensed|expired, trialStart, activatedAt }`
- `key:{CODE}` → `{ valid, usedBy, usedAt }`
