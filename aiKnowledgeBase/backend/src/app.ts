import express from "express";
import cors from "cors";
import { userRouter } from './routes/user.routes';
import { authRouter } from "./routes/auth.routes";
import { docRouter } from './routes/document.routes';
import { queryRouter } from './routes/query.routes';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/documents', docRouter);
app.use('/query', queryRouter);

export default app;