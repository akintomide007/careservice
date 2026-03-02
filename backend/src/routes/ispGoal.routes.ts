import { Router } from 'express';
import { ispGoalController } from '../controllers/ispGoal.controller';
import { requireAuth, requireNonLandlord } from '../middleware/auth';

const router = Router();

// Block landlord access to ISP goals (client PHI)
router.use(requireAuth, requireNonLandlord);

router.get('/goals', ispGoalController.getGoals);
router.post('/goals', ispGoalController.createGoal);
router.put('/goals/:id', ispGoalController.updateGoal);
router.get('/goals/:goalId/activities', ispGoalController.getGoalActivities);
router.post('/goals/:goalId/activities', ispGoalController.addActivity);
router.put('/milestones/:id', ispGoalController.updateMilestone);

export default router;
