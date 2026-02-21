import jwt from 'jsonwebtoken';
import bcrypt  from 'bcrypt';
import express from "express";
import { prisma } from '../db';
import "dotenv/config";

const signinRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

signinRouter.get('/', (req, res) => {
    res.json({
        msg: "Hello from Sign In"
    })
})

signinRouter.post('/', async (req, res) => {
    const { username, password } = req.body;

    // if username and password are there
    if (username && password) {
        try {
            // try getting the entry from db for the given username 
            const user = await prisma.user.findUnique({
                where: {
                    username
                },
                select: {
                    id : true,
                    username: true,
                    password: true
                }
            }) 

            // if user exists
            if (user != null) {
                // if user exists compare the db passwordHash with given password
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result) {
                        // if password matches then sign jwt token and respond
                        const token = jwt.sign({userId: user.id, username: user.username}, JWT_SECRET);

                        return res.status(200).json({
                            success: true,
                            data: {
                                message : "Login successful",
                                token: token
                            }
                        })
                    } else {
                        // if password is not matching give incorrect password error
                        return res.status(401).json({
                            success: false,
                            error: "Incorrect Password"
                        })
                    }
                })
            } else {
                // if username is not in the db send user not exist error
                return res.status(401).json({
                    success: false,
                    error: "User does not exist"
                })
            }
        } catch(e) {
            // if error during the db call and password comparison send error  
            return res.status(400).json({
                success: false,
                error: e
            })
        }

    } else {
        // if username or password not given then send invalid input error
        return res.status(400).json({
            success: false,
            error: "Invalid Input"
        })
    }
})

export default signinRouter; 