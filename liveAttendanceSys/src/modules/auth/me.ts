import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { User } from "../../config/db/db.models";

export const userRouter = express.Router();

userRouter.use(authMiddleware)

userRouter.get('/', async (req, res) => {
    const payload = req.user;

    const user = await User.findOne({_id: payload?.userId}, {password: 0, __v: 0})

    return res.status(200).json({
        success: true,
        data: user
    })
})