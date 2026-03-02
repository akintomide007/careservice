import { Router } from 'express';
import { authenticate, requireRole, requireManager, requireNonLandlord } from '../middleware/auth';
import { createNote, submitNote, approveNote, getNotes, getNote, updateNote } from '../controllers/progressNote.controller';

const router = Router();

// Block landlord access to all progress notes (client PHI)
router.use(authenticate, requireNonLandlord);

// DSP creates and manages their own progress notes
router.post('/', requireRole('dsp'), createNote);
router.put('/:id', requireRole('dsp'), updateNote);
router.post('/:id/submit', requireRole('dsp'), submitNote);

// Manager approves progress notes (staff supervision)
router.post('/:id/approve', requireManager, approveNote);

// All authenticated users can view notes (filtered by permissions in controller)
router.get('/', getNotes);
router.get('/:id', getNote);

export default router;
