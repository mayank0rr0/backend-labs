import express from "express";
import authRouter from "./auth/route";
import bookRouter from "./bookings/routes";

const app = express();
const PORT = 3030;

app.use(express.json());
app.use('/auth', authRouter);
app.use('/bookings', bookRouter);

app.get('/health', (req , res) => {
    return res.status(200).json({msg : "alive"})
});

app.listen(PORT, (e) => console.log(`listening at http://localhost:${PORT}`));