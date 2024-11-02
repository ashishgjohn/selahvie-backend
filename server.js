import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import { app } from "./app.js";

configDotenv();

const DB = process.env.DATABASE ?? '';
const DBNAME = process.env.DATABASE_NAME ?? '';
const PORT = process.env.PORT;

mongoose.connect(DB, {
    dbName: DBNAME
}).then(() => {
    console.log(`${DBNAME} database connected!`);
});

app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}...`);
});