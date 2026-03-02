import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../../src/utils/jwt';

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || 'http://localhost:3001';

describe('User Management Integration Tests', () => {
  let adminToken: string;
  let managerToken: string;
  let org: any;

  beforeAll(async () => {
    // Create test organization
    org = await prisma.organization.create({
      data: {
        name: 'Test Care Org',
        subdomain: 'test-care',
        isActive: true,
      },
    });

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        organizationId: org.id,
        azureAdId: 'admin_test',
        email: 'admin@testcare.com',
        password: 'hashed',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
      },
    });

    adminToken = generateToken({
      userId: admin.id,
      email: admin.email,
      role: 'admin',
      organizationId: org.id,
      organizationName: org.name,
      isLandlord: false,
    });

    // Create manager user
    const manager = await prisma.user.create({
      data: {
        organizationId: org.id,
        azureAdId: 'manager_test',
        email: 'manager@testcare.com',
        password: 'hashed',
        firstName: 'Manager',
        lastName: 'User',
        role: 'manager',
        isActive: true,
      },
    });

    managerToken = generateToken({
      userId: manager.id,
      email: manager.email,
      role: 'manager',
      organizationId: org.id,
      organizationName: org.name,
      isLandlord: false,
    });
  });

  describe('Admin User Creation', () => {
    it('should allow admin to create managers', async () => {
      const response = await request(API_URL)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'manager2@testcare.com',
          password: 'Manager123!',
          firstName: 'Manager',
          lastName: 'Two',
          role: 'manager',
        });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('manager');
      expect(response.body.email).toBe('manager2@testcare.com');
    });

    it('should allow admin to create DSPs', async () => {
      const response = await request(API_URL)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'dsp1@testcare.com',
          password: 'DSP123!',
          firstName: 'DSP',
          lastName: 'One',
          role: 'dsp',
        });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('dsp');
    });

    it('should allow admin to create other admins', async () => {
      const response = await request(API_URL)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'admin2@testcare.com',
          password: 'Admin2123!',
          firstName: 'Admin',
          lastName: 'Two',
          role: 'admin',
        });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('admin');
    });
  });

  describe('Manager User Creation Restrictions', () => {
    it('should allow manager to create DSPs only', async () => {
      const response = await request(API_URL)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          email: 'dsp2@testcare.com',
          password: 'DSP2123!',
          firstName: 'DSP',
          lastName: 'Two',
          role: 'dsp',
        });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('dsp');
    });

    it('should prevent manager from creating other managers', async () => {
      const response = await request(API_URL)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          email: 'manager3@testcare.com',
          password: 'Manager3123!',
          firstName: 'Manager',
          lastName: 'Three',
          role: 'manager',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('can only create DSP');
    });

    it('should prevent manager from creating admins', async () => {
      const response = await request(API_URL)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          email: 'admin3@testcare.com',
          password: 'Admin3123!',
          firstName: 'Admin',
          lastName: 'Three',
          role: 'admin',
        });

      expect(response.status).toBe(403);
    });
  });
});
