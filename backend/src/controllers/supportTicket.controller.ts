import { Response } from 'express';
import { AuthRequest } from '../types';
import supportTicketService from '../services/supportTicket.service';

export class SupportTicketController {
  // Create ticket
  async createTicket(req: AuthRequest, res: Response) {
    try {
      const { organizationId, userId } = req.user!;
      
      const ticket = await supportTicketService.createTicket({
        organizationId,
        reportedBy: userId,
        ...req.body
      });

      res.status(201).json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get tickets
  async getTickets(req: AuthRequest, res: Response) {
    try {
      const { organizationId, isLandlord } = req.user!;
      const { status, priority, category, assignedTo, reportedBy } = req.query;

      // Super admins can see all tickets, others only their org's tickets
      const filters: any = {
        status: status as string,
        priority: priority as string,
        category: category as string,
        assignedTo: assignedTo as string,
        reportedBy: reportedBy as string
      };

      if (!isLandlord) {
        filters.organizationId = organizationId;
      }

      const tickets = await supportTicketService.getTickets(filters);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get ticket by ID
  async getTicketById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const ticket = await supportTicketService.getTicketById(id);

      // Check access
      const { organizationId, isLandlord } = req.user!;
      if (!isLandlord && ticket.organizationId !== organizationId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.json(ticket);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  // Update ticket
  async updateTicket(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const ticket = await supportTicketService.updateTicket(id, req.body);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Assign ticket
  async assignTicket(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;

      const ticket = await supportTicketService.assignTicket(id, assignedTo);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Resolve ticket
  async resolveTicket(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.user!;
      const { resolution } = req.body;

      const ticket = await supportTicketService.resolveTicket(id, {
        resolution,
        resolvedBy: userId
      });

      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Close ticket
  async closeTicket(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const ticket = await supportTicketService.closeTicket(id);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Add comment
  async addComment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.user!;
      const { comment, isInternal } = req.body;

      const ticketComment = await supportTicketService.addComment({
        ticketId: id,
        userId,
        comment,
        isInternal
      });

      res.status(201).json(ticketComment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get ticket statistics
  async getTicketStats(req: AuthRequest, res: Response) {
    try {
      const { organizationId, isLandlord } = req.user!;
      const { orgId } = req.query;

      let targetOrgId: string | undefined;

      if (isLandlord && orgId) {
        targetOrgId = orgId as string;
      } else if (!isLandlord) {
        targetOrgId = organizationId;
      }

      const stats = await supportTicketService.getTicketStats(targetOrgId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get user's tickets
  async getUserTickets(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.user!;
      const tickets = await supportTicketService.getUserTickets(userId);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new SupportTicketController();
