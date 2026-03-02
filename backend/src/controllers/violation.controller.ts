import { Response } from 'express';
import { AuthRequest } from '../types';
import { violationService } from '../services/violation.service';

export const violationController = {
  // Create new violation
  async createViolation(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId } = req.user!;
      
      // All authenticated users can report violations (DSP, Manager, Admin)
      // DSPs can self-report or witness violations
      // Managers/Admins can report violations on staff
      
      const violation = await violationService.createViolation({
        organizationId,
        reportedBy: userId,
        ...req.body
      });

      return res.status(201).json(violation);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Get violations for organization
  async getViolations(req: AuthRequest, res: Response) {
    try {
      const { organizationId, role } = req.user!;

      if (role !== 'manager' && role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const filters = {
        userId: req.query.userId as string,
        status: req.query.status as string,
        severity: req.query.severity as string,
        violationType: req.query.violationType as string,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined
      };

      const violations = await violationService.getViolations(organizationId, filters);
      return res.json(violations);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get user's violations
  async getUserViolations(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId } = req.user!;
      const status = req.query.status as string | undefined;

      const violations = await violationService.getUserViolations(userId, organizationId, status);
      return res.json(violations);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get violation by ID
  async getViolationById(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;
      const { id } = req.params;

      const violation = await violationService.getViolationById(id, organizationId);
      
      if (!violation) {
        return res.status(404).json({ error: 'Violation not found' });
      }

      return res.json(violation);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Update violation
  async updateViolation(req: AuthRequest, res: Response) {
    try {
      const { role } = req.user!;
      const { id } = req.params;

      if (role !== 'manager' && role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const violation = await violationService.updateViolation(id, req.body);
      return res.json(violation);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Resolve violation
  async resolveViolation(req: AuthRequest, res: Response) {
    try {
      const { userId, role } = req.user!;
      const { id } = req.params;
      const { resolution } = req.body;

      if (role !== 'manager' && role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to resolve violations' });
      }

      const violation = await violationService.resolveViolation(id, userId, resolution);
      return res.json(violation);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Appeal violation
  async appealViolation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { appealNotes } = req.body;

      if (!appealNotes) {
        return res.status(400).json({ error: 'Appeal notes are required' });
      }

      const violation = await violationService.appealViolation(id, appealNotes);
      return res.json(violation);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Resolve appeal
  async resolveAppeal(req: AuthRequest, res: Response) {
    try {
      const { userId, role } = req.user!;
      const { id } = req.params;
      const { approved, notes } = req.body;

      if (role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can resolve appeals' });
      }

      const violation = await violationService.resolveAppeal(id, userId, approved, notes);
      return res.json(violation);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // Get user violation summary
  async getUserViolationSummary(req: AuthRequest, res: Response) {
    try {
      const { organizationId } = req.user!;
      const { userId } = req.params;

      const summary = await violationService.getUserViolationSummary(userId, organizationId);
      return res.json(summary);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Get organization statistics
  async getOrganizationStatistics(req: AuthRequest, res: Response) {
    try {
      const { organizationId, role } = req.user!;

      if (role !== 'manager' && role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const stats = await violationService.getOrganizationStatistics(organizationId);
      return res.json(stats);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  // Delete violation
  async deleteViolation(req: AuthRequest, res: Response) {
    try {
      const { userId, role } = req.user!;
      const { id } = req.params;

      if (role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can delete violations' });
      }

      await violationService.deleteViolation(id, userId);
      return res.json({ message: 'Violation deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
};
