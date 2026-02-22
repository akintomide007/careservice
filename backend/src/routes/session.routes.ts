import { Router } from 'express';
import { authenticate, requireRole, requireManager } from '../middleware/auth';
import { clockIn, clockOut, getActive, getHistory, getAllSessions } from '../controllers/session.controller';

const router = Router();

// DSP only - Clock in/out (patient care)
router.post('/clock-in', authenticate, requireRole('dsp'), clockIn);
router.post('/clock-out', authenticate, requireRole('dsp'), clockOut);

// DSP can view their own sessions
router.get('/active', authenticate, getActive);
router.get('/history', authenticate, getHistory);

// Manager can view all sessions (staff supervision)
router.get('/all', authenticate, requireManager, getAllSessions);

export default router;
