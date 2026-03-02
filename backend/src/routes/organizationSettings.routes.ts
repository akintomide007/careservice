import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as organizationSettingsController from '../controllers/organizationSettings.controller';

const router = Router();

// Middleware to check if user is admin or landlord
const requireAdminOrLandlord = (req: any, res: any, next: any) => {
  if (req.user?.role === 'admin' || req.user?.role === 'super_admin' || req.user?.isLandlord) {
    return next();
  }
  return res.status(403).json({ error: 'Only admins and landlords can access organization settings' });
};

// Get organization settings - all authenticated users can view
router.get('/settings', requireAuth, organizationSettingsController.getSettings);

// Update organization settings - only admins and landlords
router.put('/settings', requireAuth, requireAdminOrLandlord, organizationSettingsController.updateSettings);

// Upload logo - only admins and landlords
router.post('/settings/upload-logo', requireAuth, requireAdminOrLandlord, organizationSettingsController.uploadLogo);

export default router;
