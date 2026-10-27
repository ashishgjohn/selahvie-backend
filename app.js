import express from 'express';
import { router as versesRouter } from './routes/versesRoute.js';
import { router as imagesRouter } from './routes/imagesRoute.js';
import { router as randomImageRouter } from './routes/randomImageRoute.js';
import { router as shareRouter } from './routes/shareRoute.js';
import { router as eventsRouter } from './routes/eventsRoute.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import AppError from "./utils/appError.js";
import path from 'path';

const app = express();

app.use(morgan('combined'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const isProduction = (process.env.NODE_ENV ?? '').toLowerCase() === 'production';

const allowedOrigins = [
    'https://selahvie.life',
    'chrome-extension://pfhbgcocdbpplkacchpekhcdempaphlj',
];

app.use(cors({
    origin: function (origin, callback) {
        // In development (local testing) allow any origin, so an unpacked
        // dev build of the extension — which has a different id each load —
        // can reach the local server. Production keeps the strict whitelist.
        if (!isProduction || !origin || allowedOrigins.includes(origin)) {
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
app.use('/api/share', shareRouter);
app.use('/api/events', eventsRouter);
app.use('/imgs', express.static(path.join('imgs')));

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server.`, '404'));
});

export { app };