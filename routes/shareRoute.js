import express from 'express';
import { handleShare } from '../controllers/shareController.js';

const router = express.Router();

router.get('/', handleShare);

export { router };