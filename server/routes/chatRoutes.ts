import { Router } from 'express';
import { ChatController } from '../controllers/chatController';

export const chatRouter = Router();

chatRouter.post('/', ChatController.chat);
