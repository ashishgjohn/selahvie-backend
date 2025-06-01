import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import { app } from "./app.js";

configDotenv();

const DB = process.env.DATABASE ?? '';
const DBNAME = process.env.DATABASE_NAME ?? '';
const PORT = process.env.PORT;

mongoose.connect(DB, {
    dbName: DBNAME,
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true  // Only temporarily while we debug
}).then(() => {
    console.log(`${DBNAME} database connected!`);
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}...`);
});