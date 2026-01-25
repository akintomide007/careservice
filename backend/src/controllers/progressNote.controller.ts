import { Response } from 'express';
import { AuthRequest, ProgressNoteInput, ApprovalAction } from '../types';
import * as progressNoteService from '../services/progressNote.service';

export async function createNote(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const data: ProgressNoteInput = req.body;
    
    if (!data.clientId || !data.serviceType || !data.serviceDate || !data.startTime || !data.endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const note = await progressNoteService.createProgressNote(req.user.id, data);
    return res.status(201).json(note);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function submitNote(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { id } = req.params;
    const note = await progressNoteService.submitProgressNote(id, req.user.id);
    
    return res.json(note);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function approveNote(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { id } = req.params;
    const action: ApprovalAction = req.body;
    
    if (!action.action) {
      return res.status(400).json({ error: 'Action is required' });
    }
    
    const note = await progressNoteService.approveProgressNote(id, req.user.id, action);
    return res.json(note);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function getNotes(req: AuthRequest, res: Response) {
  try {
    const { staffId, clientId, status, startDate, endDate } = req.query;
    
    const notes = await progressNoteService.getProgressNotes({
      staffId: staffId as string,
      clientId: clientId as string,
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string
    });
    
    return res.json(notes);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getNote(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const note = await progressNoteService.getProgressNoteById(id);
    
    if (!note) {
      return res.status(404).json({ error: 'Progress note not found' });
    }
    
    return res.json(note);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateNote(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { id } = req.params;
    const data = req.body;
    
    const note = await progressNoteService.updateProgressNote(id, req.user.id, data);
    return res.json(note);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
