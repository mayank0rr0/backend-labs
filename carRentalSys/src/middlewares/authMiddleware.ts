import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET || "secret"

export const authMiddleware = function (req : Request, res: Response, next: NextFunction) {
    const authHeader = req.get('Authorization');

    // if authHeader exists
    if (authHeader) {
        // extract token from the header
        const token = authHeader.split(' ')[1] || ""

        // if token is not present give error message
        if (token == "") {
            return res.status(401).json({
                success: false,
                error: "Token missing after Bearer"
            })
        }

        try {
            // if token is present try verifying it
            const decoded = jwt.verify( token, JWT_SECRET)
            // add jwt payload to body
            req.body = {...req.body, user: decoded};
            // move to request handler
            return next()

        } catch (e) {
            // if invalid token give error 
            return res.status(401).json({
                success: false,
                error: "Token invalid"
            })
        }


    } else {
        // if auth header is missing give error  
        return res.status(401).json({
            success: false,
            error: "Authorization header missing"
        })
    }
    
}