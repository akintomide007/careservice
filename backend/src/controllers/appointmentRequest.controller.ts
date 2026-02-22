import { Response } from 'express';
import { AuthRequest } from '../types';
import { appointmentRequestService } from '../services/appointmentRequest.service';

export const appointmentRequestController = {
  async createRequest(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId } = req.user!;
      const {
        clientId,
        appointmentType,
        urgency,
        reason,
        notes,
        preferredDates,
        preferredTimes,
        location,
        provider,
        providerPhone,
        transportation,
      } = req.body;

      if (!clientId || !appointmentType || !urgency || !reason || !preferredDates) {
        return res.status(400).json({
          error: 'Missing required fields: clientId, appointmentType, urgency, reason, preferredDates',
        });
      }

      const request = await appointmentRequestService.createRequest({
        organizationId,
        clientId,
        requestedBy: userId,
        appointmentType,
        urgency,
        reason,
        notes,
        preferredDates,
        preferredTimes,
        location,
        provider,
        providerPhone,
        transportation,
      });

      return res.status(201).json(request);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to create appointment request' });
    }
  },

  async getRequests(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId, role } = req.user!;
      const { status, urgency, clientId, appointmentType } = req.query;

      const filters: any = {
        status: status as string,
        urgency: urgency as string,
        clientId: clientId as string,
        appointmentType: appointmentType as string,
      };

      if (role === 'dsp') {
        filters.requestedBy = userId;
      }

      const requests = await appointmentRequestService.getRequests(organizationId, filters);

      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch appointment requests' });
    }
  },

  async getRequestById(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId, role } = req.user!;
      const { id } = req.params;

      const request = await appointmentRequestService.getRequestById(id, organizationId);

      if (!request) {
        return res.status(404).json({ error: 'Appointment request not found' });
      }

      if (role === 'dsp' && request.requestedBy !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.json(request);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to fetch appointment request' });
    }
  },

  async updateRequest(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId } = req.user!;
      const { id } = req.params;
      const updateData = req.body;

      const request = await appointmentRequestService.updateRequest(
        id,
        organizationId,
        userId,
        updateData
      );

      return res.json(request);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to update appointment request' });
    }
  },

  async approveRequest(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId, role } = req.user!;
      const { id } = req.params;
      const { reviewNotes, scheduledDate, createSchedule, scheduleData } = req.body;

      if (role !== 'manager' && role !== 'admin') {
        return res.status(403).json({ error: 'Only managers and admins can approve requests' });
      }

      if (!scheduledDate) {
        return res.status(400).json({ error: 'scheduledDate is required' });
      }

      const request = await appointmentRequestService.approveRequest(
        id,
        organizationId,
        userId,
        {
          reviewNotes,
          scheduledDate,
          createSchedule: createSchedule || false,
          scheduleData,
        }
      );

      return res.json(request);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to approve appointment request' });
    }
  },

  async rejectRequest(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId, role } = req.user!;
      const { id } = req.params;
      const { reviewNotes } = req.body;

      if (role !== 'manager' && role !== 'admin') {
        return res.status(403).json({ error: 'Only managers and admins can reject requests' });
      }

      if (!reviewNotes) {
        return res.status(400).json({ error: 'reviewNotes is required for rejection' });
      }

      const request = await appointmentRequestService.rejectRequest(
        id,
        organizationId,
        userId,
        reviewNotes
      );

      return res.json(request);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to reject appointment request' });
    }
  },

  async cancelRequest(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId } = req.user!;
      const { id } = req.params;

      const request = await appointmentRequestService.cancelRequest(id, organizationId, userId);

      return res.json(request);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to cancel appointment request' });
    }
  },

  async getStatistics(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId, role } = req.user!;

      const stats = await appointmentRequestService.getStatistics(organizationId, userId, role);

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch statistics' });
    }
  },
};
