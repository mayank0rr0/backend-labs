import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import type { UserCreateInput } from "../generated/prisma/models";
import "dotenv/config"

const JWT_SECRET = process.env.JWT_SECRET || "secret"

// Create new user
export const createUser = async (data: UserCreateInput) => {
    try {
        const hash = await bcrypt.hash(data.password, 10) 
        await prisma.user.create({
            data: {
                ...data,
                password: hash
            }
        })

        return {
            success: true,
            data: {
                message: "User successfully created"
            }
        }
    } catch (e) {
        console.error(e);
        return {
            success: false,
            data: {
                message: "DB error"
            }
        }
    }
}

// User Login and create JWT token 
export const loginUser = async (data : {email: string, password: string}) => {
    try {
        const result = await prisma.user.findUnique({
            where: {email: data.email},
            select: {
                id: true,
                email: true,
                password: true
            }
        })
        
        if (!result) {
            throw new Error
        }

        const check = await bcrypt.compare(data.password, result.password) 

        if (check) {
            const token = jwt.sign({
                userId: result.id,
                email: result.email
            }, JWT_SECRET)

            return {
                success: true,
                data: {
                    token
                }
            }
        } else {
            return  {
                success: false,
                error: "Unable to create user"
            }
        }

    } catch (e) {
        console.error(e);
        return  {
            success: false,
            error: "DB error"
        }
    }
}

// Check is user exist
export const checkUser = async (email?: string, userId?: string ) => {
    try {
        const data = (email) ? {email: email} : userId ? { id: userId } : undefined

        if (data) {
            const result = await prisma.user.findUnique({
                where: data
            })

            return result
        } else {
            return undefined
        }
    } catch (e) {
        console.error(e);
        return undefined
    }
}