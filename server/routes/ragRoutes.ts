import { Router } from 'express';
import { RagController } from '../controllers/ragController';

export const ragRouter = Router();

ragRouter.post('/retrieve', RagController.retrieve);
ragRouter.get('/sources', RagController.getSources);
ragRouter.get('/conflicts', RagController.getConflicts);
