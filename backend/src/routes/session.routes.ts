import { Router } from 'express';
import { authenticate, requireRole, requireManager, requireNonLandlord } from '../middleware/auth';
import { clockIn, clockOut, getActive, getHistory, getAllSessions } from '../controllers/session.controller';

const router = Router();

// Block landlord access to all service sessions (client PHI)
router.use(authenticate, requireNonLandlord);

// DSP only - Clock in/out (patient care)
router.post('/clock-in', requireRole('dsp'), clockIn);
router.post('/clock-out', requireRole('dsp'), clockOut);

// DSP can view their own sessions
router.get('/active', getActive);
router.get('/history', getHistory);

// Manager can view all sessions (staff supervision)
router.get('/all', requireManager, getAllSessions);

export default router;
