# 🎮 XENO SHOP — Valorant ID Store

ร้านขายไอดี Valorant สไตล์ Gaming ได้แรงบันดาลใจจาก Valorant

---

## 📁 โครงสร้างไฟล์

```
/
├── index.html        ← หน้าหลัก (Single Page)
├── styles.css        ← ธีม Gaming สีส้ม-ดำ
├── script.js         ← Logic ทั้งหมด
├── accounts.json     ← ข้อมูลไอดีตั้งต้น
└── vercel.json       ← Config สำหรับ Deploy บน Vercel
```

---

## 🚀 วิธี Deploy บน Vercel

### วิธีที่ 1 — Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### วิธีที่ 2 — Drag & Drop
1. ไปที่ https://vercel.com/new
2. ลากโฟลเดอร์ทั้งหมดวางในหน้า Deploy
3. กด Deploy — เสร็จแล้ว!

### วิธีที่ 3 — GitHub
1. Push โค้ดขึ้น GitHub
2. เชื่อม repo กับ Vercel
3. Auto-deploy ทุกครั้งที่ Push

---

## 🔐 Admin Panel

- กดปุ่ม **ADMIN** มุมขวาบน
- รหัสผ่านเริ่มต้น: **123456**
- เปลี่ยนรหัสได้ที่ `script.js` → `CONFIG.ADMIN_PIN`

---

## ✏️ การแก้ไขข้อมูล

### ข้อมูลไอดีตั้งต้น
แก้ไขไฟล์ `accounts.json` โดยตรง:

```json
[
  {
    "id": "acc_001",
    "name": "ชื่อไอดี",
    "rank": "Immortal 2",
    "rankTier": "immortal",
    "skins": 47,
    "price": 2500,
    "status": "available",
    "image": "URL รูปภาพ หรือ base64",
    "description": "รายละเอียด",
    "createdAt": "2024-01-01"
  }
]
```

**rankTier ที่รองรับ:** radiant, immortal, ascendant, diamond, platinum, gold, silver, bronze, iron

### ข้อมูลที่เพิ่มผ่าน Admin Panel
จะเก็บใน **localStorage** ของเบราว์เซอร์ผู้ใช้ (ไม่ได้แก้ไฟล์ JSON บน server)

---

## 🎨 ปรับแต่ง

- **สี:** แก้ CSS Variables ใน `styles.css` บรรทัดแรก
- **โลโก้/ชื่อร้าน:** แก้ `index.html` หาคำว่า `XENO.SHOP`
- **รหัส Admin:** แก้ `CONFIG.ADMIN_PIN` ใน `script.js`
- **Font:** เปลี่ยน `@import` ใน `styles.css`

---

## 📱 รองรับทุกอุปกรณ์

✅ Desktop  ✅ Tablet  ✅ Mobile

---

Made with ❤️ — Gaming Style Inspired by Valorant
