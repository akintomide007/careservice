import { Router } from 'express';
import supportTicketController from '../controllers/supportTicket.controller';
import usageMetricController from '../controllers/usageMetric.controller';
import { requireAuth, requireAdmin, requireLandlord } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Support tickets
router.post('/tickets', supportTicketController.createTicket);
router.get('/tickets', supportTicketController.getTickets);
router.get('/tickets/my', supportTicketController.getUserTickets);
router.get('/tickets/stats', supportTicketController.getTicketStats);
router.get('/tickets/:id', supportTicketController.getTicketById);
router.put('/tickets/:id', requireAdmin, supportTicketController.updateTicket);
router.post('/tickets/:id/assign', requireAdmin, supportTicketController.assignTicket);
router.post('/tickets/:id/resolve', requireAdmin, supportTicketController.resolveTicket);
router.post('/tickets/:id/close', requireAdmin, supportTicketController.closeTicket);
router.post('/tickets/:id/comments', supportTicketController.addComment);

// Usage metrics
router.post('/metrics', requireLandlord, usageMetricController.recordMetric);
router.get('/metrics/organization', usageMetricController.getOrganizationMetrics);
router.get('/metrics/system', requireLandlord, usageMetricController.getSystemMetrics);
router.get('/metrics/usage', usageMetricController.calculateUsage);
router.get('/metrics/summary', usageMetricController.getMetricsSummary);
router.post('/metrics/track-api', usageMetricController.trackApiCall);
router.post('/metrics/storage', requireLandlord, usageMetricController.updateStorageUsage);
router.post('/metrics/counts', requireAdmin, usageMetricController.updateCounts);
router.delete('/metrics/old', requireLandlord, usageMetricController.deleteOldMetrics);

export default router;
