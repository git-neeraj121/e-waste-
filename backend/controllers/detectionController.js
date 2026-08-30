import { geminiService } from '../services/geminiService.js';

export const detectWaste = async (req, res, next) => {
  try {
    const { image, mimeType } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Base64 image data string is required' });
    }

    const items = await geminiService.detectWasteFromImage(image, mimeType || 'image/jpeg');
    res.json({ items });
  } catch (error) {
    next(error);
  }
};
