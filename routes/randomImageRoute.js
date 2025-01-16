import { Router } from "express";
import { getRandomImage } from "../controllers/randomImageController.js";

const router = Router();

router.get('/', getRandomImage);

export { router };