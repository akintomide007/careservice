import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    // Fetch user with organization details
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        organization: true
      }
    });
    
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }
    
    if (!user.organization.isActive) {
      res.status(403).json({ error: 'Organization is inactive' });
      return;
    }
    
    // Attach user and organization to request
    req.user = {
      id: user.id,
      userId: user.id, // Alias for consistency
      email: user.email,
      role: user.role,
      azureAdId: user.azureAdId,
      isLandlord: user.isLandlord || false,
      organizationId: user.organizationId,
      organizationName: user.organization.name
    };
    
    req.organization = user.organization;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    
    next();
  };
}

// Alias for authenticate
export const requireAuth = authenticate;

// Require admin role (organization administrator only)
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  
  if (req.user.role !== 'admin' && !req.user.isLandlord) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  
  next();
}

// Require manager role (staff supervisor)
export function requireManager(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  
  if (req.user.role !== 'manager' && req.user.role !== 'admin' && !req.user.isLandlord) {
    res.status(403).json({ error: 'Manager access required' });
    return;
  }
  
  next();
}

// Require specific role(s)
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    if (!roles.includes(req.user.role) && !req.user.isLandlord) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    
    next();
  };
}

// Require super admin
export function requireLandlord(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  
  if (!req.user.isLandlord) {
    res.status(403).json({ error: 'Landlord access required' });
    return;
  }
  
  next();
}

// Require admin or manager (for user management)
export function requireAdminOrManager(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'manager' && !req.user.isLandlord) {
    res.status(403).json({ error: 'Admin or Manager access required' });
    return;
  }
  
  next();
}

// Prevent landlords from accessing client PHI/data
// Landlords manage tenants/organizations, not client care data
export function requireNonLandlord(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  
  if (req.user.isLandlord) {
    res.status(403).json({ error: 'Landlords cannot access client data for privacy compliance' });
    return;
  }
  
  next();
}
