import { Router } from "express";
import { getImageWithVerse } from "../controllers/imagesController.js";

const router = Router();

router.get("/", getImageWithVerse);

export { router };