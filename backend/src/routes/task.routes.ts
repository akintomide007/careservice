import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate, requireManager, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Manager creates and manages tasks (staff supervision)
router.post('/', requireManager, taskController.createTask);
router.put('/:id', requireManager, taskController.updateTask);

// All authenticated users can view tasks (filtered by controller)
router.get('/my-tasks', taskController.getUserTasks);
router.get('/assigned', taskController.getAssignedTasks);
router.get('/statistics', taskController.getTaskStatistics);
router.get('/:id', taskController.getTaskById);

// DSP completes tasks (patient care)
router.post('/:id/start', requireRole('dsp'), taskController.startTask);
router.post('/:id/complete', requireRole('dsp'), taskController.completeTask);

// DSP manages checklist items
router.post('/:id/checklist', requireRole('dsp'), taskController.addChecklistItem);
router.put('/checklist/:itemId', requireRole('dsp'), taskController.toggleChecklistItem);
router.delete('/checklist/:itemId', requireRole('dsp'), taskController.deleteChecklistItem);

// DSP adds task results, Manager verifies
router.post('/:id/results', requireRole('dsp'), taskController.addTaskResult);
router.put('/results/:resultId/verify', requireManager, taskController.verifyTaskResult);

export default router;
