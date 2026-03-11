import { docUpload } from './../services/document.services';
import type { Request, Response } from "express";

export const docUploadReq = async (req: Request , res: Response) => {
    const fileData = req.file; 
    const userId = req.user?.userId;

    if (fileData && userId) {
        const result = await docUpload(userId, fileData)

        if (result.success) {
            return res.status(200).json(result)
        } else {
            return res.status(500).json(result)
        }
    } else {
        return res.status(401).json({
            error : "No file"
        })
    }
}