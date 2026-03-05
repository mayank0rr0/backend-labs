import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config"

const JWT_SECRET = process.env.JWT_SECRET || "secret"

export interface UserPayload {
    userId: string,
    role: string
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(' ')[1] || undefined
    
    if (!authHeader) {

        return res.status(403).json({
            success: false,
            error: "No Auth Header Provided"
        })
    } else if (!token) {

        return res.status(403).json({
            success: false,
            error: "No JWT Token Provided"
        })
    } else {
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            req.user = payload as UserPayload;
            next();
            
        } catch(e) {
            console.error(e);
            return res.status(403).json({
                success: false,
                error: "Invalid token"
            })
        }
    }

}