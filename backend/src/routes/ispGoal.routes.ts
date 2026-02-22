import { Router } from 'express';
import { ispGoalController } from '../controllers/ispGoal.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/goals', ispGoalController.getGoals);
router.post('/goals', ispGoalController.createGoal);
router.put('/goals/:id', ispGoalController.updateGoal);
router.post('/goals/:goalId/activities', ispGoalController.addActivity);
router.put('/milestones/:id', ispGoalController.updateMilestone);

export default router;
