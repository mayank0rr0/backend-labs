import express from "express";
import bcrypt from "bcrypt";
import { ZodError } from "zod";
import { User } from "../../config/db/db.models";
import { SignupSchema } from "../../schema/auth.schema";

export const signupRouter = express.Router();

// Sign up POST endpoint
signupRouter.post("/", async (req, res) => {
  try {
    // try to parse req body data
    const parsedData = SignupSchema.parse(req.body);
    
    // hash the password
    const hash = await bcrypt.hash(parsedData.password, 10) 

    // create new user using User model
    const user = new User({...parsedData, password: hash});
    // save the user
    await user.save();

    // respond with the user data
    return res.status(200).json({
      success: true,
      data: {
        _id : user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
 
  } catch (e) {
    // on error log to console
    console.error(e);

    // if zod error
    if (e instanceof ZodError) {
      // give Invalid input
      return res.status(401).json({
        success: false,
        error: "Invalid Input"
      })
    } else if ((e as Error).message.includes("E1100") ) {
      // if error has e1100 code from MongoServer dup error 
      return res.status(409).json({
        success: false,
        error: "User already exists"
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