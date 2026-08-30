import { User } from '../models/User.js';

export const getUserStats = async (req, res, next) => {
  try {
    const stats = await User.getStats(req.user.id);
    if (!stats) {
      return res.status(404).json({ error: "User stats not found" });
    }
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
