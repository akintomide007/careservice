import { Router } from 'express';
import notificationController from '../controllers/notification.controller';
import { authenticate, requireAdmin, requireLandlord } from '../middleware/auth';

const router = Router();

// User notification routes
router.get('/', authenticate, notificationController.getNotifications);
router.get('/unread-count', authenticate, notificationController.getUnreadCount);
router.get('/preferences', authenticate, notificationController.getPreferences);
router.put('/preferences', authenticate, notificationController.updatePreferences);
router.post('/test', authenticate, notificationController.sendTestNotification);
router.get('/:id', authenticate, notificationController.getNotificationById);
router.post('/:id/read', authenticate, notificationController.markAsRead);
router.post('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);
router.delete('/clear-all', authenticate, notificationController.clearReadNotifications);

// Admin notification routes
router.post('/send', requireAdmin, notificationController.sendNotification);
router.get('/stats', requireAdmin, notificationController.getNotificationStats);

// Super admin routes
router.post('/broadcast', requireLandlord, notificationController.broadcastNotification);

export default router;
