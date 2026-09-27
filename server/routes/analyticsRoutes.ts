import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';

export const analyticsRouter = Router();

analyticsRouter.get('/summary', AnalyticsController.getSummary);
analyticsRouter.get('/recurring', AnalyticsController.getRecurring);
analyticsRouter.post('/goal', AnalyticsController.calculateGoal);
analyticsRouter.post('/simulate', AnalyticsController.simulate);
