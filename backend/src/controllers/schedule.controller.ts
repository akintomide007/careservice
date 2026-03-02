import { Response } from 'express';
import { AuthRequest } from '../types';
import { scheduleService } from '../services/schedule.service';

export const scheduleController = {
  async createSchedule(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId, role } = req.user!;
      
      if (role !== 'manager' && role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Convert date strings to Date objects
      const scheduleData: any = {
        organizationId,
        createdBy: userId,
        ...req.body
      };

      // Ensure startTime and endTime are proper Date objects
      if (scheduleData.startTime) {
        scheduleData.startTime = new Date(scheduleData.startTime);
      }
      if (scheduleData.endTime) {
        scheduleData.endTime = new Date(scheduleData.endTime);
      }
      if (scheduleData.recurrenceEnd) {
        scheduleData.recurrenceEnd = new Date(scheduleData.recurrenceEnd);
      }

      const schedule = await scheduleService.createSchedule(scheduleData);

      return res.status(201).json(schedule);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  async getUserSchedules(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId } = req.user!;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const schedules = await scheduleService.getUserSchedules(userId, organizationId, startDate, endDate);
      return res.json(schedules);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getOrganizationSchedules(req: AuthRequest, res: Response) {
    try {
      const { organizationId, role } = req.user!;
      
      if (role === 'dsp') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const filters = {
        userId: req.query.userId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        shiftType: req.query.shiftType as string,
        status: req.query.status as string
      };

      const schedules = await scheduleService.getOrganizationSchedules(organizationId, filters);
      return res.json(schedules);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getCalendarSchedules(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId, role } = req.user!;
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const schedules = await scheduleService.getCalendarSchedules(organizationId, userId, role!, startDate, endDate);
      return res.json(schedules);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  async updateSchedule(req: AuthRequest, res: Response) {
    try {
      const { role } = req.user!;
      
      if (role !== 'manager' && role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Convert date strings to Date objects if present
      const updateData: any = { ...req.body };
      if (updateData.startTime) {
        updateData.startTime = new Date(updateData.startTime);
      }
      if (updateData.endTime) {
        updateData.endTime = new Date(updateData.endTime);
      }

      const schedule = await scheduleService.updateSchedule(req.params.id, updateData);
      return res.json(schedule);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  async deleteSchedule(req: AuthRequest, res: Response) {
    try {
      const { role } = req.user!;
      
      if (role !== 'manager' && role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await scheduleService.deleteSchedule(req.params.id);
      return res.json({ message: 'Schedule deleted successfully' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
};
