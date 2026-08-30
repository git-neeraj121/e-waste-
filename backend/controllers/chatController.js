import { geminiService } from '../services/geminiService.js';

export const handleChat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid chat message is required' });
    }

    const reply = await geminiService.generateChatResponse(message, history || []);
    res.json({ response: reply });
  } catch (error) {
    next(error);
  }
};
