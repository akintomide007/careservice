import { Response } from 'express';
import { AuthRequest, IncidentReportInput } from '../types';
import * as incidentService from '../services/incident.service';

export async function createIncident(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const data: IncidentReportInput = req.body;
    
    if (!data.clientId || !data.incidentDate || !data.incidentTime || !data.severity || !data.incidentType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const incident = await incidentService.createIncidentReport(req.user.id, data);
    return res.status(201).json(incident);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function getIncidents(req: AuthRequest, res: Response) {
  try {
    const { staffId, clientId, status, severity, startDate, endDate } = req.query;
    
    const incidents = await incidentService.getIncidentReports({
      staffId: staffId as string,
      clientId: clientId as string,
      status: status as string,
      severity: severity as string,
      startDate: startDate as string,
      endDate: endDate as string
    });
    
    return res.json(incidents);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getIncident(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const incident = await incidentService.getIncidentReportById(id);
    
    if (!incident) {
      return res.status(404).json({ error: 'Incident report not found' });
    }
    
    return res.json(incident);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateIncidentStatus(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const incident = await incidentService.updateIncidentStatus(id, req.user.id, status);
    return res.json(incident);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
