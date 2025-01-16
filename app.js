import express from 'express';
import { router as versesRouter } from './routes/versesRoute.js';
import { router as imagesRouter } from './routes/imagesRoute.js';
import { router as randomImageRouter } from './routes/randomImageRoute.js';
import cors from 'cors';
import AppError from "./utils/appError.js";
import path from 'path';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json({ limit: '10kb' }));

app.use('/api/verses', versesRouter);
app.use('/api/images', imagesRouter);
app.use('/api/random', randomImageRouter);

app.use('/imgs', express.static(path.join('imgs')));

app.use('/', (req, res, next) => {
    res.status(200).json({
        status: 'success',
        data: 'This is the API for Selahvie'
    });
});


app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server.`, '404'));
});

export { app };