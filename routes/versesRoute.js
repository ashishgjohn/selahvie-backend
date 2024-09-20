import { Router } from "express";
import { getAllVerses, getVersesWithScore } from "../controllers/versesController.js";

const router = Router();

router.route('/').get(getAllVerses);
router.route('/:score').get(getVersesWithScore);

export { router };