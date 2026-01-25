import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getClients, getClient, createClient, updateClient, deleteClient } from '../controllers/client.controller';

const router = Router();

router.get('/', authenticate, getClients);
router.get('/:id', authenticate, getClient);
router.post('/', authenticate, authorize('admin', 'manager'), createClient);
router.put('/:id', authenticate, authorize('admin', 'manager'), updateClient);
router.delete('/:id', authenticate, authorize('admin'), deleteClient);

export default router;
