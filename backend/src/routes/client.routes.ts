import { Router } from 'express';
import { authenticate, requireAdminOrManager, requireNonLandlord } from '../middleware/auth';
import { getClients, getClient, createClient, updateClient, deleteClient } from '../controllers/client.controller';

const router = Router();

// All authenticated users can view clients (except landlords - no PHI access)
router.get('/', authenticate, requireNonLandlord, getClients);
router.get('/:id', authenticate, requireNonLandlord, getClient);

// Admins and Managers can manage clients (landlords excluded)
router.post('/', authenticate, requireNonLandlord, requireAdminOrManager, createClient);
router.put('/:id', authenticate, requireNonLandlord, requireAdminOrManager, updateClient);
router.delete('/:id', authenticate, requireNonLandlord, requireAdminOrManager, deleteClient);

export default router;
