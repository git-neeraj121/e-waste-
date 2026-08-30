import express from 'express';
import { handleChat } from '../controllers/chatController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Allow authenticated users to chat with the Gemini assistant
router.post('/', auth, handleChat);

export default router;
