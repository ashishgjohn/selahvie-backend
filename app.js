import express from 'express';
import { router as versesRouter } from './routes/versesRoute.js';
import cors from 'cors';
import AppError from "./utils/appError.js";

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json({ limit: '10kb' }));

app.use('/', (req, res, next) => {
    res.status(200).json({
        status: 'success',
        data: 'This is the API for Selahvie'
    });
});

app.use('/api/verses', versesRouter);

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server.`, '404'));
});

export { app };