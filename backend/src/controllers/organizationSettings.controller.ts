import { Response } from 'express';
import { AuthRequest } from '../types';
import * as organizationSettingsService from '../services/organizationSettings.service';

export async function getSettings(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const settings = await organizationSettingsService.getOrganizationSettings(req.user.organizationId);
    return res.json(settings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateSettings(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Only admins can update organization settings
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && !req.user.isLandlord) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const settings = await organizationSettingsService.updateOrganizationSettings(
      req.user.organizationId,
      req.body
    );

    return res.json(settings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function uploadLogo(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Only admins can upload logos
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && !req.user.isLandlord) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const logoType = (req.body.logoType || 'logo') as 'logo' | 'printLogo' | 'favicon';
    
    const result = await organizationSettingsService.uploadLogo(
      req.user.organizationId,
      logoType,
      req.file
    );

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
