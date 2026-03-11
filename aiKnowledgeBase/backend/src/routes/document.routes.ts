import express from "express";
import { docUploadReq } from "../controller/document.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import multer from "multer";

export const docRouter = express.Router();
const upload = multer({dest: "../uploads/"})

docRouter.use(authMiddleware);

docRouter.post('/upload', upload.single('document'), async (req, res) => docUploadReq(req, res)) 