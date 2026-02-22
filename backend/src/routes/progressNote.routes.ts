import { Router } from 'express';
import { authenticate, requireRole, requireManager } from '../middleware/auth';
import { createNote, submitNote, approveNote, getNotes, getNote, updateNote } from '../controllers/progressNote.controller';

const router = Router();

// DSP creates and manages their own progress notes
router.post('/', authenticate, requireRole('dsp'), createNote);
router.put('/:id', authenticate, requireRole('dsp'), updateNote);
router.post('/:id/submit', authenticate, requireRole('dsp'), submitNote);

// Manager approves progress notes (staff supervision)
router.post('/:id/approve', authenticate, requireManager, approveNote);

// All authenticated users can view notes (filtered by permissions in controller)
router.get('/', authenticate, getNotes);
router.get('/:id', authenticate, getNote);

export default router;
