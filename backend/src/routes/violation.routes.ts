import { Router } from 'express';
import { violationController } from '../controllers/violation.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Violation CRUD
router.post('/', violationController.createViolation);
router.get('/', violationController.getViolations);
router.get('/my-violations', violationController.getUserViolations);
router.get('/statistics', violationController.getOrganizationStatistics);
router.get('/user/:userId/summary', violationController.getUserViolationSummary);
router.get('/:id', violationController.getViolationById);
router.put('/:id', violationController.updateViolation);
router.delete('/:id', violationController.deleteViolation);

// Violation actions
router.post('/:id/resolve', violationController.resolveViolation);
router.post('/:id/appeal', violationController.appealViolation);
router.post('/:id/resolve-appeal', violationController.resolveAppeal);

export default router;
