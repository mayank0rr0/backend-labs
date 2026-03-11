import type { Request, Response } from "express";
import { getUser } from "../services/user.services";

export const userGetReq = async (req: Request, res: Response) => {
    const userId = req.user?.userId ?? "";
    const result = await getUser(userId)

    if (result.success) {
        return res.status(200).json(result);
    } else {
        return res.status(501).json(result)
    }
}