import express from "express";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import "dotenv/config"
import { ZodError } from 'zod';
import { SigninSchema } from './../../schema/auth.schema';
import { User } from '../../config/db/db.models';

export const signinRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Sign in POST endpoint
signinRouter.post('/', async (req, res) => {
  try {
    // try to parse the req body data
    const parsedData = SigninSchema.parse(req.body);
    
    // find the user using email
    const user = await User.findOne({email : parsedData.email});
    
    // if users exists
    if (user && user.password ) {
      // compare the password hash
      const isMatch = await bcrypt.compare(parsedData.password, user?.password);
      
      // is the password matches
      if (isMatch) {
        // generate the jwt token
        const token =  jwt.sign({
          userId: user._id,
          role: user.role
        }, JWT_SECRET);
        // send the token in response
        return res.status(200).json({
          success: true,
          data: {
            token
          }})
      
      } else {
        // if password does not matches give error
        return res.status(400).json({
          success: false,
          message: "Invalid Email or password"
        })
      }

    } else {
      // if user is not found
      return res.status(404).json({
        success: false,
        message: "No User Found"
      });
    }

  } catch (e) {
    // on error log to console
    console.error(e)

    // if zod error
    if (e instanceof ZodError) {
      // give error improper input
      return res.status(401).json({
        success: false,
        error: "Improper Input"
      }) 

    } else {
      // for all the rest errors give 501 
      return res.status(501).json({
        success: false,
        error: "Internal Server Error"
      })
    }
  }
})

