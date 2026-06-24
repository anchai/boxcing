// server.js
// Boxing Game Relay Server — จับคู่ผู้เล่น 2 คนด้วยรหัสห้อง แล้ว relay action/state ระหว่างกัน
//
// วิธีรันในเครื่อง (ทดสอบ):
//   npm install
//   node server.js
// แล้วเปิด index.html (แก้ SERVER_URL ในไฟล์นั้นให้ตรงกับ URL ของ server)
//
// วิธี deploy ฟรีบน Render: อ่านไฟล์ DEPLOY.md

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // อนุญาตทุก origin เพื่อให้เปิด index.html จากเครื่องไหนก็ต่อได้
});

app.get("/", (req, res) => {
  res.send("Boxing Game Relay Server is running. Rooms active: " + rooms.size);
});

// เก็บสถานะห้อง: roomCode -> { players: [socketId, socketId], ready: Set, hp: {} }
const rooms = new Map();

function generateRoomCode() {
  // รหัสห้อง 4 หลัก อ่านง่าย พูดง่าย (ตัวเลขล้วน)
  let code;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms.has(code));
  return code;
}

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // ผู้เล่นขอสร้างห้องใหม่ (เป็นคนแรก รอคู่ต่อสู้)
  socket.on("create_room", () => {
    const code = generateRoomCode();
    rooms.set(code, {
      players: [socket.id],
      names: {},
      hp: {},
      ready: new Set(),
    });
    socket.join(code);
    socket.data.room = code;
    socket.data.playerIndex = 0;
    socket.emit("room_created", { code, playerIndex: 0 });
    console.log(`Room ${code} created by ${socket.id}`);
  });

  // ผู้เล่นคนที่สองขอเข้าห้องด้วยรหัส
  socket.on("join_room", ({ code }) => {
    const room = rooms.get(code);
    if (!room) {
      socket.emit("join_error", { message: "ไม่พบห้องนี้ ตรวจสอบรหัสอีกครั้ง" });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit("join_error", { message: "ห้องนี้เต็มแล้ว" });
      return;
    }
    room.players.push(socket.id);
    socket.join(code);
    socket.data.room = code;
    socket.data.playerIndex = 1;
    socket.emit("room_joined", { code, playerIndex: 1 });

    // แจ้งทั้งสองฝั่งว่าพร้อมเริ่มเกมได้แล้ว (มีผู้เล่นครบ 2 คน)
    io.to(code).emit("opponent_connected");
    console.log(`Room ${code} now has 2 players`);
  });

  // ส่งต่อ action การชก/ป้องกัน ไปยังคู่ต่อสู้ในห้องเดียวกัน
  socket.on("player_action", (payload) => {
    const code = socket.data.room;
    if (!code) return;
    // ส่งให้ "คนอื่นในห้อง" เท่านั้น ไม่ส่งกลับให้ตัวเอง
    socket.to(code).emit("opponent_action", payload);
  });

  // sync ตำแหน่ง/ท่าทางแบบต่อเนื่อง (เคลื่อนที่บนเวที)
  socket.on("player_state", (payload) => {
    const code = socket.data.room;
    if (!code) return;
    socket.to(code).emit("opponent_state", payload);
  });

  // sync เลือดหลังโดนชน เพื่อกันสองฝั่งคำนวณ HP ไม่ตรงกัน (ฝั่งที่โดนตีเป็นคนหักเลือดตัวเองแล้ว broadcast)
  socket.on("hp_update", (payload) => {
    const code = socket.data.room;
    if (!code) return;
    socket.to(code).emit("opponent_hp_update", payload);
  });

  socket.on("restart_request", () => {
    const code = socket.data.room;
    if (!code) return;
    socket.to(code).emit("opponent_restart_request");
  });

  socket.on("disconnect", () => {
    const code = socket.data.room;
    if (code && rooms.has(code)) {
      io.to(code).emit("opponent_disconnected");
      rooms.delete(code);
      console.log(`Room ${code} closed (player disconnected)`);
    }
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Boxing relay server listening on port ${PORT}`);
});
