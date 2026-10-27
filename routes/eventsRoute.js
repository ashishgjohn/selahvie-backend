import { Router } from "express";
import { recordEvent } from "../controllers/eventsController.js";

const router = Router();

router.post('/', recordEvent);

export { router };
