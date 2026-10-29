# Kayfiyat Somsa

Kayfiyat Somsa — Toshkentdagi somsa kafesi uchun o‘zbek tilidagi, mobil qurilmalarga mos veb-sayt. Saytda menyuni ko‘rish, filiallarni topish va buyurtma ma’lumotlarini tayyorlash mumkin.

## Imkoniyatlar

- Bosh sahifa, menyu, filiallar va buyurtma bo‘limlari.
- Menyudagi taomlarni toifalar bo‘yicha filtrlash va savatga qo‘shish.
- Savatni brauzerning `localStorage` xotirasida saqlash.
- Olib ketish yoki yetkazib berish usulini tanlash, aloqa ma’lumotlari va izoh kiritish.
- Telefon orqali qo‘ng‘iroq qilish yoki buyurtma matnini Telegram orqali ulashish.
- Brauzer ruxsati berilganda joylashuvni aniqlash va xaritada ko‘rish.
- Xodimlar uchun buyurtmalar ro‘yxati va buyurtma holatini yangilash (backend mavjud bo‘lganda).
- Gilam naqshlari tasviri, qorong‘i rejim va kichik ekranlarga mos dizayn.

## Loyihani ishga tushirish

Loyiha oddiy statik fayllardan iborat, alohida paket o‘rnatish shart emas.

1. Repozitoriyani yoki loyiha papkasini kompyuteringizga oling.
2. `index.html` faylini brauzerda oching.

Mahalliy web-server orqali ko‘rish uchun, masalan, VS Code’dagi **Live Server** kengaytmasidan foydalaning. Saytning asosiy qismlari server talab qilmaydi; tashqi Google Fonts shriftlari, xarita havolalari va Instagram havolalari internet bilan ishlaydi.

## Fayllar

| Fayl | Vazifasi |
|---|---|
| `index.html` | Sahifa tuzilishi va bo‘limlar |
| `style.css` | Dizayn, moslashuvchan joylashuv va mavzular |
| `script.js` | Menyu, savat, filiallar, xarita va buyurtma logikasi |

## Buyurtmalar

Savat brauzerda `localStorage` orqali saqlanadi; shu sababli bir brauzerda sahifani qayta ochganda savat saqlanib qoladi. Saytning telefon va Telegram orqali buyurtma yuborish yo‘llari backend’siz ham mavjud.

Sayt `window.claude` orqali `db` va `user` xizmatlariga ulana olsa, buyurtmalarni bazaga yuborish va xodimlar bo‘limidan ularning holatini boshqarish imkoniyati yoqiladi. Bu integratsiya va tegishli ruxsatlar loyiha ishga tushiriladigan muhitda sozlangan bo‘lishi kerak. Integratsiya bo‘lmasa, saytda onlayn buyurtma yuborish tugmasi ko‘rsatilmaydi; foydalanuvchiga qo‘ng‘iroq yoki Telegram orqali bog‘lanish taklif qilinadi.

Xodimlar bo‘limi sahifa pastidagi **Xodimlar** havolasi orqali ochiladi. Buyurtmalarni ko‘rish va holatini yangilash uchun tizimda xodimning tegishli ruxsati bo‘lishi lozim.

## Eslatma

Saytda ko‘rsatilgan filial manzillari, telefon raqamlari va ish vaqti o‘zgarishi mumkin. Borishdan oldin kafega qo‘ng‘iroq qilib tekshiring. Joylashuvni aniqlash uchun brauzer ruxsati kerak; rad etilsa, manzilni qo‘lda kiritish mumkin.
