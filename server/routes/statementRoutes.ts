import { Router } from 'express';
import { StatementController } from '../controllers/statementController';

export const statementRouter = Router();

statementRouter.post('/upload', StatementController.upload);
statementRouter.post('/upload/confirm', StatementController.confirm);
