import { PrismaClient } from '@prisma/client';
import { LoginCredentials } from '../types';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

export async function login(credentials: LoginCredentials) {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      firstName: true,
      lastName: true,
      isActive: true
    }
  });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (!user.isActive) {
    throw new Error('Account is inactive');
  }
  
  const isPasswordValid = await comparePassword(credentials.password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });
  
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  };
}

export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  const hashedPassword = await hashPassword(data.password);
  
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      phone: data.phone,
      azureAdId: `local-${Date.now()}`
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      createdAt: true
    }
  });
  
  return user;
}
