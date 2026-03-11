import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { userGetReq } from "../controller/user.controller";

export const userRouter = express.Router();

userRouter.use(authMiddleware);

userRouter.get('/', async (req, res) => userGetReq(req, res) )