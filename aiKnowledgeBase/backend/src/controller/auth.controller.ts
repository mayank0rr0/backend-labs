import type { Request, Response, Router } from "express"
import { createUser, loginUser } from "../services/auth.services"


export const authSignin = async (req: Request, res: Response) =>  {
    const data = req.body
    const result = await createUser(data)

    if (result.success) {
        return res.status(200).json(result);
    } else {
        return res.status(501).json(result)
    }
}

export const authLogin = async (req: Request, res: Response) => {
    const data = req.body
    const result = await loginUser(data)

    if (result.success) {
        return res.status(200).json(result)
    } else {
        return res.status(501).json(result)
    }
}