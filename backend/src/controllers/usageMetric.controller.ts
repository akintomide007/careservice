import { Response } from 'express';
import { AuthRequest } from '../types';
import usageMetricService from '../services/usageMetric.service';

export class UsageMetricController {
  // Record metric
  async recordMetric(req: AuthRequest, res: Response) {
    try {
      const { organizationId, metricType, value } = req.body;

      const metric = await usageMetricService.recordMetric({
        organizationId,
        metricType,
        value
      });

      res.status(201).json(metric);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get organization metrics
  async getOrganizationMetrics(req: AuthRequest, res: Response) {
    try {
      const { organizationId, isLandlord } = req.user!;
      const { orgId, metricType, startDate, endDate, limit } = req.query;

      let targetOrgId = organizationId;

      // Super admins can query any organization
      if (isLandlord && orgId) {
        targetOrgId = orgId as string;
      }

      const options: any = {
        metricType: metricType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      };

      const metrics = await usageMetricService.getOrganizationMetrics(targetOrgId, options);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get system metrics (super admin only)
  async getSystemMetrics(req: AuthRequest, res: Response) {
    try {
      const { metricType, startDate, endDate } = req.query;

      const options: any = {
        metricType: metricType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const metrics = await usageMetricService.getSystemMetrics(options);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Calculate usage
  async calculateUsage(req: AuthRequest, res: Response) {
    try {
      const { organizationId, isLandlord } = req.user!;
      const { orgId } = req.query;

      let targetOrgId = organizationId;

      if (isLandlord && orgId) {
        targetOrgId = orgId as string;
      }

      const usage = await usageMetricService.calculateUsage(targetOrgId);
      res.json(usage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Track API call
  async trackApiCall(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;
      await usageMetricService.trackApiCall(organizationId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update storage usage
  async updateStorageUsage(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.body;
      const { storageMB } = req.body;

      const metric = await usageMetricService.updateStorageUsage(organizationId, storageMB);
      res.json(metric);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update counts
  async updateCounts(req: AuthRequest, res: Response) {
    try {
      const { organizationId, isLandlord } = req.user!;
      const { orgId } = req.body;

      let targetOrgId = organizationId;

      if (isLandlord && orgId) {
        targetOrgId = orgId;
      }

      const counts = await usageMetricService.updateCounts(targetOrgId);
      res.json(counts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get metrics summary
  async getMetricsSummary(req: AuthRequest, res: Response) {
    try {
      const { organizationId, isLandlord } = req.user!;
      const { orgId, days } = req.query;

      let targetOrgId = organizationId;

      if (isLandlord && orgId) {
        targetOrgId = orgId as string;
      }

      const daysNum = days ? parseInt(days as string) : 30;
      const summary = await usageMetricService.getMetricsSummary(targetOrgId, daysNum);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete old metrics (super admin only)
  async deleteOldMetrics(req: AuthRequest, res: Response) {
    try {
      const { daysToKeep } = req.body;
      const result = await usageMetricService.deleteOldMetrics(daysToKeep || 90);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new UsageMetricController();
