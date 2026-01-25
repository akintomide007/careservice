import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { clockIn, clockOut, getActive, getHistory, getAllSessions } from '../controllers/session.controller';

const router = Router();

router.post('/clock-in', authenticate, authorize('dsp', 'admin'), clockIn);
router.post('/clock-out', authenticate, authorize('dsp', 'admin'), clockOut);
router.get('/active', authenticate, getActive);
router.get('/history', authenticate, getHistory);
router.get('/all', authenticate, authorize('manager', 'admin'), getAllSessions);

export default router;
