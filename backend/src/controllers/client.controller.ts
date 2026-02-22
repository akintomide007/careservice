import { Response } from 'express';
import { AuthRequest } from '../types';
import * as clientService from '../services/client.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getClients(req: AuthRequest, res: Response) {
  try {
    const { search, isActive } = req.query;
    const organizationId = req.user!.organizationId;
    
    // DSPs see only their assigned clients
    if (req.user!.role === 'dsp') {
      const assignments = await prisma.clientDspAssignment.findMany({
        where: {
          dspId: req.user!.userId,
          isActive: true
        },
        select: { clientId: true }
      });
      
      const assignedClientIds = assignments.map(a => a.clientId);
      
      // Get only assigned clients
      const clients = await prisma.client.findMany({
        where: {
          id: { in: assignedClientIds },
          organizationId,
          ...(search && {
            OR: [
              { firstName: { contains: search as string, mode: 'insensitive' } },
              { lastName: { contains: search as string, mode: 'insensitive' } },
              { dddId: { contains: search as string, mode: 'insensitive' } }
            ]
          }),
          ...(isActive !== undefined && { isActive: isActive === 'true' })
        },
        orderBy: { lastName: 'asc' }
      });
      
      return res.json(clients);
    }
    
    // Admin and Manager see all organization clients
    const clients = await clientService.getAllClients(organizationId, {
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    });
    
    return res.json(clients);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getClient(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;
    
    // DSPs can only view their assigned clients
    if (req.user!.role === 'dsp') {
      const assignment = await prisma.clientDspAssignment.findFirst({
        where: {
          clientId: id,
          dspId: req.user!.userId,
          isActive: true
        }
      });
      
      if (!assignment) {
        return res.status(403).json({ error: 'Access denied: Client not assigned to you' });
      }
    }
    
    const client = await clientService.getClientById(id, organizationId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    return res.json(client);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createClient(req: AuthRequest, res: Response) {
  try {
    const { firstName, lastName, dateOfBirth, dddId, address, emergencyContactName, emergencyContactPhone } = req.body;
    const organizationId = req.user!.organizationId;
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    const client = await clientService.createClient(organizationId, {
      firstName,
      lastName,
      dateOfBirth,
      dddId,
      address,
      emergencyContactName,
      emergencyContactPhone
    });
    
    return res.status(201).json(client);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function updateClient(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;
    const updates = req.body;
    
    const client = await clientService.updateClient(id, organizationId, updates);
    
    return res.json(client);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function deleteClient(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;
    
    await clientService.deleteClient(id, organizationId);
    
    return res.status(204).send();
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
