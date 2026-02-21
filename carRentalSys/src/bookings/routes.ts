import express from 'express';
import bookingsRouter from './bookings';
import { authMiddleware } from '../middlewares/authMiddleware';

const bookRouter = express.Router();

bookRouter.use(authMiddleware)
bookRouter.use('/', bookingsRouter);

export default bookRouter;