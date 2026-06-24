# คู่มือ Deploy Server ฟรี (Render.com)

เกมนี้ต้องมี server กลางไว้ relay ข้อมูลระหว่างผู้เล่น 2 คนคนละเครื่อง
Render มี free tier ที่ใช้งานได้จริง ไม่ต้องผูกบัตรเครดิต เหมาะกับงานนี้ที่สุด

---

## ขั้นตอนที่ 1: เตรียมโค้ดขึ้น GitHub

1. สร้างบัญชี GitHub (github.com) ถ้ายังไม่มี
2. สร้าง repository ใหม่ ชื่ออะไรก็ได้ เช่น `thai-boxing-server`
3. อัปโหลดไฟล์ 2 ไฟล์นี้เข้า repo:
   - `server.js`
   - `package.json`

   วิธีอัปโหลดง่ายสุด: เข้าหน้า repo บนเว็บ GitHub → กด "Add file" → "Upload files" → ลากไฟล์ทั้งสองใส่ → กด commit

## ขั้นตอนที่ 2: สร้างบัญชี Render และเชื่อม GitHub

1. ไปที่ https://render.com → กด "Get Started" → สมัครด้วยบัญชี GitHub (ง่ายสุด เพราะเชื่อม repo ให้อัตโนมัติ)
2. หลัง login เข้า Dashboard กด **"New +"** → เลือก **"Web Service"**
3. เลือก repo `thai-boxing-server` ที่สร้างไว้ → กด "Connect"

## ขั้นตอนที่ 3: ตั้งค่า Web Service

กรอกค่าตามนี้:

| ช่อง | ค่าที่ใส่ |
|---|---|
| Name | thai-boxing-server (หรือชื่ออะไรก็ได้) |
| Region | Singapore (ใกล้ไทยสุด ลด latency) |
| Branch | main |
| Root Directory | เว้นว่างไว้ |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Instance Type | **Free** |

กด **"Create Web Service"**

## ขั้นตอนที่ 4: รอ deploy เสร็จ

Render จะ build และรันให้อัตโนมัติ ใช้เวลาประมาณ 1-3 นาที
เมื่อเสร็จจะเห็นข้อความ "Your service is live 🎉" และมี URL ให้ เช่น

```
https://thai-boxing-server.onrender.com
```

**คัดลอก URL นี้ไว้**

## ขั้นตอนที่ 5: เชื่อม URL เข้ากับไฟล์เกม

เปิดไฟล์ `index.html` หาบรรทัดนี้ใกล้ด้านบนของ `<script>`:

```javascript
const SERVER_URL = "https://YOUR-SERVER-URL.onrender.com";
```

แก้เป็น URL จริงที่ได้จาก Render เช่น:

```javascript
const SERVER_URL = "https://thai-boxing-server.onrender.com";
```

บันทึกไฟล์ แล้วเปิด `index.html` ในเบราว์เซอร์ (Chrome/Edge) ได้เลย — ไม่ต้องอัปโหลด index.html ขึ้นไหน ส่งไฟล์นี้ให้เพื่อนได้โดยตรง (ทั้งสองคนเปิดไฟล์เดียวกันคนละเครื่อง)

---

## ข้อควรรู้เกี่ยวกับ Free Tier ของ Render

- **server จะ sleep หลังไม่มีคนใช้ 15 นาที** — ครั้งแรกที่เข้าเกมหลัง server sleep จะช้าประมาณ 30-50 วินาที (server กำลังตื่น) ครั้งต่อไปจะเร็วปกติ ถ้าเจอ "กำลังเชื่อมต่อ..." นานๆ ให้รอสักครู่แล้วลองใหม่
- ฟรีและไม่มีวันหมดอายุ ไม่ต้องผูกบัตร
- ถ้าต้องการให้ server ไม่ sleep เลย (ตอบสนองทันทีเสมอ) ต้องอัปเกรดเป็นแบบเสียเงิน (~$7/เดือน) — สำหรับเล่นกับเพื่อนเป็นครั้งคราว free tier เพียงพอ

## การทดสอบว่า server ทำงานไหม

เปิด URL ของ server ตรงๆ ในเบราว์เซอร์ (เช่น `https://thai-boxing-server.onrender.com`)
ถ้าเห็นข้อความ `Boxing Game Relay Server is running...` แสดงว่า server พร้อมใช้งานแล้ว

## หากต้องการรันทดสอบในเครื่องตัวเองก่อน (ไม่ผ่าน Render)

ต้องลง Node.js ก่อน (nodejs.org) จากนั้นเปิด terminal ในโฟลเดอร์ที่มี `server.js` กับ `package.json`:

```bash
npm install
node server.js
```

จะเห็น `Boxing relay server listening on port 3000`
แล้วแก้ `SERVER_URL` ใน index.html เป็น `http://localhost:3000` (ใช้ทดสอบกับตัวเองในเครื่องเดียวกันได้ แต่ผู้เล่นอีกคนต้องอยู่เครื่องเดียวกันหรือ network เดียวกันเท่านั้น — ถ้าจะเล่นกับเพื่อนคนละที่จริงๆ ต้อง deploy ขึ้น Render ตามขั้นตอนข้างบน)
