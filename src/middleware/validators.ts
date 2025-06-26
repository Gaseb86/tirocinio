import { Request, Response, NextFunction } from 'express';

interface SendMessageRequest {
  text: string;
  userId: string;
  tg_id: string;
}

export const validateSendMessage = (req: Request, res: Response, next: NextFunction) => {
  const { text, userId, tg_id } = req.body as SendMessageRequest;
  
  if (!userId?.trim()) {
    return res.status(400).json({ error: "userId is required" });
  }
  if (!tg_id?.trim()) {
    return res.status(400).json({ error: "telegram_id is required" });
  }
  if (!text?.trim()) {
    return res.status(400).json({ error: "Message text is required" });
  }
  next();
};