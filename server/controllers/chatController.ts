import { Request, Response } from 'express';
import { AiService } from '../services/aiService';

export class ChatController {
  public static async chat(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, queryClass, explanationLevel } = req.body;

      if (!prompt) {
        res.status(400).json({ error: 'Missing prompt in request body' });
        return;
      }

      const result = await AiService.generateAdvice({
        prompt,
        queryClass,
        explanationLevel,
      });

      res.json(result);
    } catch (err: any) {
      console.error('Error in ChatController:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
