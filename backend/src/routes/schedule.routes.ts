import { Router } from 'express';
import { scheduleController } from '../controllers/schedule.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', scheduleController.createSchedule);
router.get('/my-schedules', scheduleController.getUserSchedules);
router.get('/organization', scheduleController.getOrganizationSchedules);
router.get('/calendar', scheduleController.getCalendarSchedules);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

export default router;
