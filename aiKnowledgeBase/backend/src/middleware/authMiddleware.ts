import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from "express";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET ?? "secret"

interface authPayload extends JwtPayload {
    userId: string,
    email: string 
}

export const authMiddleware = (req: Request, res: Response, next:NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(403).json({
            success: false,
            error: "No auth header"
        })
    }

    const token = authHeader.split(" ")[1]

    if (token) {
        try {
            const decode = jwt.verify(token, JWT_SECRET)

            req.user = decode as authPayload

            next();
        } catch (e) {
            console.error(e);
            return res.status(501).json({
                success: false,
                error: "DB error"
            })
        }
    }
}