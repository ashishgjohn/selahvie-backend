import express from 'express';
import { router as versesRouter } from './routes/versesRoute.js';
import { router as imagesRouter } from './routes/imagesRoute.js';
import { router as randomImageRouter } from './routes/randomImageRoute.js';
import cors from 'cors';
import AppError from "./utils/appError.js";
import path from 'path';

const app = express();

const allowedOrigins = [
    'https://selahvie.life', // Your main app
    'https://api.selahvie.life' // Your backend, if accessed directly
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., mobile apps, Postman) or check against allowed origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'], // Only allow these HTTP methods
    credentials: true // Allow credentials (e.g., cookies, Authorization headers)
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