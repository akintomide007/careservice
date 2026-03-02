import { Router } from 'express';
import { authenticate, authorize, requireNonLandlord } from '../middleware/auth';
import { createIncident, getIncidents, getIncident, updateIncidentStatus } from '../controllers/incident.controller';

const router = Router();

// Block landlord access to all incident reports (client PHI)
router.use(authenticate, requireNonLandlord);

router.post('/', createIncident);
router.get('/', getIncidents);
router.get('/:id', getIncident);
router.put('/:id/status', authorize('manager', 'admin'), updateIncidentStatus);

export default router;
