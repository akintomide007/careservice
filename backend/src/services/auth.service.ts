import { PrismaClient } from '@prisma/client';
import { LoginCredentials } from '../types';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

export async function login(credentials: LoginCredentials) {
  // Find user with organization
  const user = await prisma.user.findFirst({
    where: {
      email: credentials.email,
      ...(credentials.organizationId && { organizationId: credentials.organizationId })
    },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      firstName: true,
      lastName: true,
      isActive: true,
      isLandlord: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
          subdomain: true,
          isActive: true
        }
      }
    }
  });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (!user.isActive) {
    throw new Error('Account is inactive');
  }
  
  if (!user.organization.isActive) {
    throw new Error('Organization is inactive');
  }
  
  const isPasswordValid = await comparePassword(credentials.password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: user.organization.name,
    isLandlord: user.isLandlord
  });
  
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      isLandlord: user.isLandlord
    }
  };
}

export async function createUser(
  organizationId: string,
  data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
  }
) {
  // Check if user exists in this organization
  const existingUser = await prisma.user.findUnique({
    where: {
      email_organizationId: {
        email: data.email,
        organizationId
      }
    }
  });
  
  if (existingUser) {
    throw new Error('User with this email already exists in this organization');
  }
  
  const hashedPassword = await hashPassword(data.password);
  
  const user = await prisma.user.create({
    data: {
      organizationId,
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      phone: data.phone,
      azureAdId: `local-${organizationId}-${Date.now()}`
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      organizationId: true,
      createdAt: true
    }
  });
  
  return user;
}
