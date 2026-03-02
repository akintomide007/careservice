import { Response } from 'express';
import { AuthRequest, ClockInData, ClockOutData } from '../types';
import * as sessionService from '../services/session.service';

export async function clockIn(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const data: ClockInData = req.body;
    
    if (!data.clientId || !data.serviceType) {
      return res.status(400).json({ error: 'Client ID and service type are required' });
    }
    
    const session = await sessionService.clockIn(req.user.id, data);
    
    return res.status(201).json(session);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function clockOut(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const data: ClockOutData = req.body;
    
    // If no sessionId provided, find the active session
    let sessionId = data.sessionId;
    if (!sessionId) {
      const activeSessions = await sessionService.getActiveSessions(req.user.id);
      if (!activeSessions || activeSessions.length === 0) {
        return res.status(400).json({ error: 'No active session found' });
      }
      sessionId = activeSessions[0].id;
    }
    
    const session = await sessionService.clockOut(req.user.id, { sessionId });
    
    return res.json(session);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function getActive(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const sessions = await sessionService.getActiveSessions(req.user.id);
    
    return res.json(sessions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getHistory(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const sessions = await sessionService.getSessionHistory(req.user.id, limit);
    
    return res.json(sessions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAllSessions(req: AuthRequest, res: Response) {
  try {
    const { staffId, clientId, status, startDate, endDate } = req.query;
    
    const sessions = await sessionService.getAllSessions({
      staffId: staffId as string,
      clientId: clientId as string,
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string
    });
    
    return res.json(sessions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
