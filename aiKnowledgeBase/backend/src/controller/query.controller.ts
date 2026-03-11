import type {Response, Request} from "express";
import { postReq } from "../services/query.services";

export const postQueryReq = async (req: Request, res: Response) => {
    const query =  req.body;
    const userId = req.user?.userId
    
    if (query && userId) {
        const result = await postReq(query, userId)

        if (result.success) {
            return res.status(200).json(result)
        } else {
            return res.status(501).json(result)
        }  
    }
    
}