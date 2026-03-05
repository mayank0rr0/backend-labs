import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { setupWs } from "./modules/ws/ws.index";
import { dbConnect } from "./config/db/db";
import authRouter from "./modules/auth/auth.index";
import { classRouter } from "./modules/class/class.index";
import { studentRouter } from "./modules/students/students.index";
import { attendanceRouter } from "./modules/attendance/attendance.index"

const PORT = 3000;
const app = express();

app.use(express.json());
app.use('/auth', authRouter);
app.use('/class', classRouter);
app.use('/students', studentRouter);
app.use('/attendance', attendanceRouter);

// DB CODE
dbConnect();

// WS CODE
const server = http.createServer(app);
// Creating WebSocketServer with no server attached
const wss = new WebSocketServer({ noServer : true });

// Putting WS connection handler here
setupWs(wss);

// Upgrade only for specific paths other than that destroy the socket
server.on('upgrade', (req, socket, head) => {
    
    if (req.url?.includes("/ws")) {   
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req)
        })
    } else {
        socket.destroy()
    }
})

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
