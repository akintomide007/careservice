import { Router } from 'express';
import { clientAssignmentController } from '../controllers/clientAssignment.controller';
import { requireAuth, requireAdminOrManager } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/assignments', requireAdminOrManager, clientAssignmentController.getAssignments);
router.post('/assignments', requireAdminOrManager, clientAssignmentController.createAssignment);
router.delete('/assignments/:id', requireAdminOrManager, clientAssignmentController.removeAssignment);
router.get('/dsp/:dspId/clients', clientAssignmentController.getDspClients);
router.get('/my-clients', clientAssignmentController.getDspClients);

export default router;
