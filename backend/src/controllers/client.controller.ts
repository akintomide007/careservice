import { Response } from 'express';
import { AuthRequest } from '../types';
import * as clientService from '../services/client.service';

export async function getClients(req: AuthRequest, res: Response) {
  try {
    const { search, isActive } = req.query;
    
    const clients = await clientService.getAllClients({
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
    
    const client = await clientService.getClientById(id);
    
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
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    const client = await clientService.createClient({
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
    const updates = req.body;
    
    const client = await clientService.updateClient(id, updates);
    
    return res.json(client);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function deleteClient(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    
    await clientService.deleteClient(id);
    
    return res.status(204).send();
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
