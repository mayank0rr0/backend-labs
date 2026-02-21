import express from "express";
import signinRouter from "./signin";
import signupRouter from "./signup";

const authRouter = express.Router();

authRouter.use('/login', signinRouter);
authRouter.use('/signup', signupRouter)


export default authRouter;