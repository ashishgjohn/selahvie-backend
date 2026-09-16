import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import { app } from "./app.js";

configDotenv();

// Pick the database based on the environment.
// On your laptop (NODE_ENV=DEVELOPMENT) -> safe practice database.
// On the live server (NODE_ENV=production) -> real users' database.
const isProd = (process.env.NODE_ENV ?? '').toLowerCase() === 'production';

const DB = process.env.DATABASE ?? '';
const DBNAME = isProd
    ? (process.env.DATABASE_NAME ?? '')
    : (process.env.DATABASE_NAME_DEV ?? `${process.env.DATABASE_NAME ?? 'SelahVie'}_dev`);
const PORT = process.env.PORT;

mongoose.connect(DB, {
    dbName: DBNAME,
}).then(() => {
    console.log(`[${process.env.NODE_ENV}] ${DBNAME} database connected!`);
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}...`);
});