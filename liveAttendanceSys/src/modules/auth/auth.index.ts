import express from "express";
import { signinRouter } from "./login";
import { signupRouter } from "./signup";
import { userRouter } from "./me";

const authRouter = express.Router();

authRouter.use('/login', signinRouter);
authRouter.use('/signup', signupRouter);
authRouter.use('/me', userRouter)

export default authRouter