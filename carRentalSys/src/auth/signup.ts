import express from "express";
import { prisma } from "../db";
import bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace";

const signupRouter = express.Router();

signupRouter.get('/', (req, res) => {
    return res.json({
        msg: "Hello from Sign Up"
    })
})

signupRouter.post('/', async (req, res) => {
    const {username, password} = req.body;
    console.log(username, password)
    
    if (username && password) {
        // hash the password acquired and use it to create an account
        bcrypt.hash(password, 10, async function (err, hash) {
            try {
                // try creating the user
                const newUser = await prisma.user.create({
                    data: {
                        username,
                        password: hash
                    },
                    select : {
                        id : true
                    }
                })
                // on success give userId
                return res.status(201).json({
                    success: true,
                    data: {
                        message: "User created successfully",
                        userId: newUser.id
                    }
                })
            } catch (e) {
                // catch the error and check its type for prisma error
                if (e instanceof PrismaClientKnownRequestError){
                    // if the error is regarding duplicate entry for user field 
                    if (e.code === "P2002") {
                        // return error user already exists
                        return res.status(409).json({
                            success: false,
                            error: "User already exists"
                        })
                    }
                } 
                // other than that return internal server error always
                return res.status(500).json({
                    success: false,
                    error: e
                })
            }
        })

    } else {
        // if username and password does not exist return invalid input error message
        res.status(400).json({
            success: false,
            error: "Invalid inputs"
        })
    }
})

export default signupRouter;