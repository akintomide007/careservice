import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { getClients, getClient, createClient, updateClient, deleteClient } from '../controllers/client.controller';

const router = Router();

// All authenticated users can view clients
router.get('/', authenticate, getClients);
router.get('/:id', authenticate, getClient);

// Only admins can manage clients (organization administration)
router.post('/', authenticate, requireRole('admin'), createClient);
router.put('/:id', authenticate, requireRole('admin'), updateClient);
router.delete('/:id', authenticate, requireRole('admin'), deleteClient);

export default router;
