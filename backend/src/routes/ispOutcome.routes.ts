import { Router } from 'express';
import { ispOutcomeController } from '../controllers/ispOutcome.controller';
import { requireAuth, requireNonLandlord } from '../middleware/auth';

const router = Router();

// Block landlord access to ISP outcomes (client PHI)
router.use(requireAuth, requireNonLandlord);

router.get('/outcomes', ispOutcomeController.getOutcomes);
router.get('/outcomes/:id', ispOutcomeController.getOutcome);
router.post('/outcomes', ispOutcomeController.createOutcome);
router.put('/outcomes/:id', ispOutcomeController.updateOutcome);
router.delete('/outcomes/:id', ispOutcomeController.deleteOutcome);

export default router;
