import http from 'http';
import url from 'url';
import jwt from 'jsonwebtoken';
import "dotenv/config";
import { WebSocket } from 'ws';
import type { UserPayload } from '../../middlewares/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || ""

export const wsAuth = (ws: WebSocket ,req: http.IncomingMessage) => {
    const token = url.parse(req.url || '', true).query.token
    
    if (!token) {
        ws.close(1000, "token not found");
    }
    
    if (typeof token == "string") {
        const decode = jwt.verify(token, JWT_SECRET)

        ws.user = decode as UserPayload
    } else {
        ws.close(1000, "Multiple Tokens")
    }

}