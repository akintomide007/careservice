import { Router } from 'express';
import { serviceStrategyController } from '../controllers/serviceStrategy.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Service strategy CRUD
router.get('/', serviceStrategyController.getStrategies);
router.get('/by-category', serviceStrategyController.getStrategiesByCategory);
router.get('/:id', serviceStrategyController.getStrategyById);
router.post('/', serviceStrategyController.createStrategy);
router.put('/:id', serviceStrategyController.updateStrategy);
router.delete('/:id', serviceStrategyController.deleteStrategy);

// Reordering
router.post('/reorder', serviceStrategyController.reorderStrategies);

export default router;
