import { Response } from 'express';
import { AuthRequest } from '../types';
import { serviceStrategyService } from '../services/serviceStrategy.service';

export const serviceStrategyController = {
  // Get all strategies
  async getStrategies(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;
      const category = req.query.category as string | undefined;

      const strategies = await serviceStrategyService.getStrategies(organizationId, category);
      return res.json(strategies);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get strategies grouped by category
  async getStrategiesByCategory(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;

      const strategies = await serviceStrategyService.getStrategiesByCategory(organizationId);
      return res.json(strategies);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get strategy by ID
  async getStrategyById(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;
      const { id } = req.params;

      const strategy = await serviceStrategyService.getStrategyById(id, organizationId);
      
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }

      return res.json(strategy);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Create new strategy
  async createStrategy(req: AuthRequest, res: Response) {
    try {
      const { organizationId, role } = req.user!;

      // Only admins can create strategies
      if (role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to create strategies' });
      }

      const strategy = await serviceStrategyService.createStrategy({
        organizationId,
        ...req.body
      });

      return res.status(201).json(strategy);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Update strategy
  async updateStrategy(req: AuthRequest, res: Response) {
    try {
      const { role } = req.user!;
      const { id } = req.params;

      // Only admins can update strategies
      if (role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update strategies' });
      }

      const strategy = await serviceStrategyService.updateStrategy(id, req.body);
      return res.json(strategy);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Delete strategy
  async deleteStrategy(req: AuthRequest, res: Response) {
    try {
      const { role } = req.user!;
      const { id } = req.params;

      // Only admins can delete strategies
      if (role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete strategies' });
      }

      await serviceStrategyService.deleteStrategy(id);
      return res.json({ message: 'Strategy deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Reorder strategies
  async reorderStrategies(req: AuthRequest, res: Response) {
    try {
      const { organizationId, role } = req.user!;
      const { category, orderedIds } = req.body;

      // Only admins can reorder strategies
      if (role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to reorder strategies' });
      }

      const strategies = await serviceStrategyService.reorderStrategies(organizationId, category, orderedIds);
      return res.json(strategies);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
};
