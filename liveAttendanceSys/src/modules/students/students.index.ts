import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { User } from "../../config/db/db.models";

export const studentRouter = express.Router();

studentRouter.use(authMiddleware);

studentRouter.get('/', async (req, res) => {
    // get user object from auth middleware.
    const user = req.user;

    try {
        if (user && user.role != "teacher") {
            return res.status(403).json({
                success: false,
                error: "Forbidden, only teachers allowed"
            })
        }

        const data = await User.find({role: "student"}, {__v: 0, password:0, role:0})

        res.status(200).json({
            success: true,
            data: data
        })
    } catch(e) {
        console.error(e);

        return res.status(501).json({
            success: false,
            error: "Internal server error"
        })
    }
})