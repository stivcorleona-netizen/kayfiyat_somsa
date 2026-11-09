# Kayfiyat Somsa: sayt + Telegram buyurtma boshqaruvi

Sayt (`index.html`, `style.css`, `script.js`) va `api/` papkasidagi funksiyalar Vercel'da birga ishlaydi.

## Qanday ishlaydi
1. Mijoz saytda buyurtma beradi. `api/order.js` buyurtmani tekshiradi (narxni serverda qayta hisoblaydi) va admin guruhiga yuboradi.
2. Guruhdagi xabar tagida tugmalar bor: 🟡 Buyurtma qabul qilindi, 🟢 Tayyorlanmoqda, 🟠 Tayyor, 🚚 Kuryerga berildi, ✅ Yetkazib berildi, ❌ Bekor qilish.
3. Admin tugma bosganda holat o'zgaradi, guruhdagi xabar yangilanadi (tarixi vaqti va kim bosgani bilan), mijozga Telegramdan xabar ketadi.
4. Mijoz sahifasi har 5 soniyada holatni so'raydi (`api/status.js`).

Olib ketish buyurtmalarida kuryer bosqichi yo'q, oxirgi tugma "✅ Topshirildi".

## Holatlar zanjiri
`Yangi → Qabul qilindi → Tayyorlanmoqda → Tayyor → (Kuryerga berildi) → Yetkazib berildi`
- Bosqichlarni sakrab bo'lmaydi, orqaga qaytib bo'lmaydi, bir tugmani qayta bosish hech narsani o'zgartirmaydi.
- ❌ Bekor qilish yetkazib berilgunga qadar istalgan paytda, avval tasdiq so'raydi.
- Yetkazib berilgan yoki bekor qilingan buyurtma yopiladi, tugmalar olib tashlanadi.

## Mijozga xabar
Mijoz buyurtmadan keyin "Telegramda kuzatish" tugmasini bossa, bot unga yozadigan bo'ladi.
Ulanmagan mijozga xabar yuborilmaydi: guruhdagi xabarda 🔕 belgisi chiqadi va holat faqat guruhda va saytda yangilanadi.
Mijoz botni bloklagan bo'lsa, guruhda ⚠️ ogohlantirish chiqadi (telefon orqali bog'lanish mumkin).

## Admin huquqi
Tugmalarni faqat sozlangan guruhdagi **adminlar** (yoki guruh egasi) bosa oladi.
Muayyan odamlarga ruxsat berish uchun `ADMIN_USER_IDS` o'zgaruvchisiga ularning Telegram raqamlarini vergul bilan yozing (bu berilsa, faqat shular bosa oladi).

## Guruhda buyruq
`/bugun` yozilsa, bugungi buyurtmalar xulosasi chiqadi (holatlar bo'yicha soni va oxirgi 15 tasi). Faqat adminlar uchun.

## O'rnatish (bir marta)

1. **Guruh raqami (chat ID).** Botni guruhga qo'shing va admin qiling, guruhga `/start@kayfiyatt_somsa_bot` yozing, brauzerda `https://api.telegram.org/bot<TOKEN>/getUpdates` ni oching va `"chat":{"id":...` raqamini oling (webhook ulashdan OLDIN).
2. **Fayllarni GitHub'ga yuklang** (`api` papkasi bilan). Vercel o'zi qayta joylaydi.
3. **Redis.** Vercel loyihasida Storage > Upstash Redis (bepul) yarating va loyihaga ulang. `KV_REST_API_URL` va `KV_REST_API_TOKEN` o'zi qo'shiladi.
4. **Environment Variables:**

| Nomi | Qiymati |
|---|---|
| `TELEGRAM_BOT_TOKEN` | BotFather tokeni (faqat Vercel'da saqlang) |
| `TELEGRAM_CHAT_ID` | 1-qadamdagi guruh raqami |
| `TELEGRAM_WEBHOOK_SECRET` | uzun tasodifiy matn (harf, raqam, `_`, `-`) |
| `ADMIN_USER_IDS` | ixtiyoriy: ruxsat berilgan Telegram raqamlari, vergul bilan |
| `ORDER_TTL_DAYS` | ixtiyoriy: buyurtmalar saqlanish muddati, standart 30 kun |
| `BRANCH_CHATS` | ixtiyoriy: filial guruhlari `{"0":"-100..","2":"-100.."}` |
| `OWNER_CHAT_ID` | ixtiyoriy: egasi barcha buyurtma nusxasini ko'radigan chat |

Keyin **Redeploy** qiling.

5. **Webhook** (brauzerga bitta qatorda; `<` `>` belgilarisiz). `allowed_updates` buyurtma tugmalari va xabarlar kelishini ta'minlaydi:
`https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<SAYT>/api/telegram&secret_token=<SECRET>&allowed_updates=["message","callback_query"]`
`{"ok":true}` chiqsa, tayyor.

## Sinash
Kompyuterda (Telegram va Redis'siz, soxta muhitda): `node tests/api.test.js`. 31 ta tekshiruv: tugmalar, admin huquqi, ikki marta bosish, parallel bosish, mijozga xabar, bekor qilish va boshqalar.
Haqiqiy sinov ro'yxati loyiha egasiga alohida berilgan.

## Ma'lumotlar bazasi: nega Upstash Redis
- Vercel'ning serverless funksiyalari xotirani saqlamaydi, shuning uchun tashqi baza kerak.
- Buyurtma kichik JSON hujjat, holat tez-tez o'zgaradi, o'qish/yozish tezligi muhim: Redis aynan shunga mos.
- Vercel'ga bir tugmada ulanadi, bepul tarifi bir kafe uchun yetadi, alohida server shart emas.
- Atomik amallar (`SET NX`) takroriy buyurtma, ikki marta bosish va bir xil update'dan himoya qiladi.
- Chegarasi: buyurtmalar `ORDER_TTL_DAYS` (standart 30 kun) saqlanadi, murakkab hisobotlar yo'q. Uzoq muddatli tarix va statistika kerak bo'lsa, keyin Postgres (Neon) qo'shiladi.

## Xavfsizlik
- Bot tokeni faqat Vercel Environment Variables'da, frontendda yo'q.
- Webhook maxfiy kalit bilan himoyalangan (noto'g'ri kalitga 401).
- Narx va jami summa serverda qayta hisoblanadi, mijoz yuborgan summa hisobga olinmaydi.
- Mijoz kiritgan matn Telegram HTML'iga xavfsiz (escape) qilinadi.
- Kuzatish: holat so'rovi va Telegramga ulanish buyurtma raqami bilan birga maxfiy kalit talab qiladi, boshqa buyurtmani topib bo'lmaydi.
- Bir IP'dan daqiqasiga 5 tadan ortiq buyurtma qabul qilinmaydi.

## Menyu yoki narx o'zgarsa
`script.js` ichidagi `M` va `api/_lib.js` ichidagi `MENU` ro'yxatlarini bir xil o'zgartiring.
Filial qo'shilsa, `B` (script.js) va `BR` (api/_lib.js) bir xil bo'lishi kerak.
