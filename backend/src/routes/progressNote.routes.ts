import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { createNote, submitNote, approveNote, getNotes, getNote, updateNote } from '../controllers/progressNote.controller';

const router = Router();

router.post('/', authenticate, authorize('dsp', 'admin'), createNote);
router.post('/:id/submit', authenticate, authorize('dsp', 'admin'), submitNote);
router.post('/:id/approve', authenticate, authorize('manager', 'admin'), approveNote);
router.get('/', authenticate, getNotes);
router.get('/:id', authenticate, getNote);
router.put('/:id', authenticate, authorize('dsp', 'admin'), updateNote);

export default router;
