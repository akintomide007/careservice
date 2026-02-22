import { Request, Response } from 'express';
import { login as loginService, createUser } from '../services/auth.service';
import { AuthRequest, LoginCredentials } from '../types';

export async function login(req: Request, res: Response) {
  try {
    const credentials: LoginCredentials = req.body;
    
    if (!credentials.email || !credentials.password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const result = await loginService(credentials);
    return res.json(result);
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
}

export async function register(req: AuthRequest, res: Response) {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;
    
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Use organizationId from authenticated user
    const organizationId = req.user!.organizationId;
    
    const user = await createUser(organizationId, {
      email,
      password,
      firstName,
      lastName,
      role,
      phone
    });
    
    return res.status(201).json(user);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
