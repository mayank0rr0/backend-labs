import express from "express";
import { postQueryReq } from "../controller/query.controller";

export const queryRouter = express.Router();

queryRouter.post('/', (req,res) => postQueryReq(req, res) )