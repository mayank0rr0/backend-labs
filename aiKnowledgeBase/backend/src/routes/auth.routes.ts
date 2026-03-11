import express from "express";
import { authLogin, authSignin } from "../controller/auth.controller";

export const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => authSignin(req, res));

authRouter.post("/login", async (req, res) => authLogin(req, res));
