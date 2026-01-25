import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createIncident, getIncidents, getIncident, updateIncidentStatus } from '../controllers/incident.controller';

const router = Router();

router.post('/', authenticate, createIncident);
router.get('/', authenticate, getIncidents);
router.get('/:id', authenticate, getIncident);
router.put('/:id/status', authenticate, authorize('manager', 'admin'), updateIncidentStatus);

export default router;
