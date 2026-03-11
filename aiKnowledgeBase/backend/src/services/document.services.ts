import axios, { AxiosError } from "axios"
import { prisma } from "../db"
import FormData from "form-data"
import fs from "fs";

export const docUpload = async (userId: string, fileData : Express.Multer.File) => {
    try {
        console.log("request processing")

        // call the ai-service /ingest endpoint 
        const form = new FormData();
        
        form.append('file', fs.createReadStream(fileData.path), {
            filename: fileData.originalname,
            contentType: fileData.mimetype,
        });

        console.log("form data ready")
        
        const response = await axios.post(
            'http://localhost:8000/ingest', form, {
                params: {  user_id : userId },
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        )

        fs.unlink(fileData.path, () => {})

        console.log("request made")

        // TODO : Improve
        if (!response.data.success) {
            throw Error
        }
        
        const result = await prisma.document.create({
            data: {
                filename: fileData.fieldname,
                filepath: fileData.destination,
                userId: userId
            }
        })
        return {
            success: true,
            data: result
        }

    } catch (e) {
        console.log(e);

        if (e instanceof AxiosError) {
            return {
                message: e.response?.data
            }
        }

        return {
            success: false,
            error: "DB error"
        }

    }
}