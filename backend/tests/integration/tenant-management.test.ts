import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../../src/utils/jwt';

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || 'http://localhost:3001';

describe('Tenant Management Integration Tests', () => {
  let landlordToken: string;
  let landlordUser: any;

  beforeAll(async () => {
    // Create landlord organization
    const landlordOrg = await prisma.organization.create({
      data: {
        name: 'System Admin',
        subdomain: 'system',
        isActive: true,
      },
    });

    // Create landlord user
    const hashedPassword = await bcrypt.hash('landlord123', 10);
    landlordUser = await prisma.user.create({
      data: {
        organizationId: landlordOrg.id,
        azureAdId: 'landlord_001',
        email: 'landlord@careservice.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        role: 'admin',
        isLandlord: true,
        isActive: true,
      },
    });

    landlordToken = generateToken({
      userId: landlordUser.id,
      email: landlordUser.email,
      role: landlordUser.role,
      organizationId: landlordOrg.id,
      organizationName: landlordOrg.name,
      isLandlord: true,
    });
  });

  describe('POST /api/admin/tenants - Create Tenant with Admin', () => {
    it('should allow landlord to create tenant with initial admin', async () => {
      const response = await request(API_URL)
        .post('/api/admin/tenants')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send({
          name: 'Acme Care Services',
          subdomain: 'acme-care',
          plan: 'professional',
          maxUsers: 100,
          maxClients: 500,
          adminEmail: 'admin@acmecare.com',
          adminPassword: 'AcmeAdmin123!',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Acme Care Services');
      expect(response.body.subdomain).toBe('acme-care');
      expect(response.body.initialCredentials).toBeDefined();
      expect(response.body.initialCredentials.email).toBe('admin@acmecare.com');
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].role).toBe('admin');
    });

    it('should prevent duplicate subdomains', async () => {
      // Create first tenant
      await request(API_URL)
        .post('/api/admin/tenants')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send({
          name: 'First Tenant',
          subdomain: 'duplicate-test',
        });

      // Try to create duplicate
      const response = await request(API_URL)
        .post('/api/admin/tenants')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send({
          name: 'Second Tenant',
          subdomain: 'duplicate-test',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already taken');
    });
  });

  describe('Tenant Data Isolation', () => {
    it('should ensure complete data isolation between tenants', async () => {
      // Create Tenant A
      const tenantA = await request(API_URL)
        .post('/api/admin/tenants')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send({
          name: 'Tenant A',
          subdomain: 'tenant-a',
          adminEmail: 'admin@tenant-a.com',
          adminPassword: 'TenantA123!',
        });

      // Create Tenant B
      const tenantB = await request(API_URL)
        .post('/api/admin/tenants')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send({
          name: 'Tenant B',
          subdomain: 'tenant-b',
          adminEmail: 'admin@tenant-b.com',
          adminPassword: 'TenantB123!',
        });

      // Get admin tokens for both tenants
      const adminAUser = tenantA.body.users[0];
      const adminBUser = tenantB.body.users[0];

      const tokenA = generateToken({
        userId: adminAUser.id,
        email: adminAUser.email,
        role: adminAUser.role,
        organizationId: tenantA.body.id,
        organizationName: tenantA.body.name,
        isLandlord: false,
      });

      const tokenB = generateToken({
        userId: adminBUser.id,
        email: adminBUser.email,
        role: adminBUser.role,
        organizationId: tenantB.body.id,
        organizationName: tenantB.body.name,
        isLandlord: false,
      });

      // Create client in Tenant A
      const clientA = await request(API_URL)
        .post('/api/clients')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          firstName: 'Client',
          lastName: 'A',
          dateOfBirth: '1990-01-01',
        });

      expect(clientA.status).toBe(201);

      // Try to access Tenant A's clients from Tenant B
      const clientsB = await request(API_URL)
        .get('/api/clients')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(clientsB.status).toBe(200);
      expect(clientsB.body).toHaveLength(0); // Should not see Tenant A's client
    });
  });

  describe('Multiple Admins Per Tenant', () => {
    it('should allow creating multiple admins in one tenant', async () => {
      // Create tenant
      const tenant = await request(API_URL)
        .post('/api/admin/tenants')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send({
          name: 'Multi Admin Tenant',
          subdomain: 'multi-admin',
          adminEmail: 'admin1@multi.com',
          adminPassword: 'Admin1Pass!',
        });

      const firstAdmin = tenant.body.users[0];
      const adminToken = generateToken({
        userId: firstAdmin.id,
        email: firstAdmin.email,
        role: firstAdmin.role,
        organizationId: tenant.body.id,
        organizationName: tenant.body.name,
        isLandlord: false,
      });

      // First admin creates second admin
      const secondAdmin = await request(API_URL)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'admin2@multi.com',
          password: 'Admin2Pass!',
          firstName: 'Second',
          lastName: 'Admin',
          role: 'admin',
        });

      expect(secondAdmin.status).toBe(201);
      expect(secondAdmin.body.role).toBe('admin');

      // Third admin
      const thirdAdmin = await request(API_URL)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'admin3@multi.com',
          password: 'Admin3Pass!',
          firstName: 'Third',
          lastName: 'Admin',
          role: 'admin',
        });

      expect(thirdAdmin.status).toBe(201);

      // Verify all admins exist
      const users = await request(API_URL)
        .get('/api/admin/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(users.body).toHaveLength(3);
    });
  });

  describe('Landlord Client Data Restrictions', () => {
    it('should prevent landlord from accessing client data', async () => {
      // Create tenant with client
      const tenant = await request(API_URL)
        .post('/api/admin/tenants')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send({
          name: 'Privacy Test Tenant',
          subdomain: 'privacy-test',
        });

      const admin = tenant.body.users[0];
      const adminToken = generateToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role,
        organizationId: tenant.body.id,
        organizationName: tenant.body.name,
        isLandlord: false,
      });

      // Admin creates client
      await request(API_URL)
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Protected',
          lastName: 'Client',
        });

      // Landlord tries to access clients
      const response = await request(API_URL)
        .get('/api/clients')
        .set('Authorization', `Bearer ${landlordToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('cannot access client data');
    });

    it('should prevent landlord from accessing progress notes', async () => {
      const response = await request(API_URL)
        .get('/api/progress-notes')
        .set('Authorization', `Bearer ${landlordToken}`);

      expect(response.status).toBe(403);
    });

    it('should prevent landlord from accessing incident reports', async () => {
      const response = await request(API_URL)
        .get('/api/incidents')
        .set('Authorization', `Bearer ${landlordToken}`);

      expect(response.status).toBe(403);
    });

    it('should prevent landlord from accessing service sessions', async () => {
      const response = await request(API_URL)
        .get('/api/sessions/history')
        .set('Authorization', `Bearer ${landlordToken}`);

      expect(response.status).toBe(403);
    });

    it('should prevent landlord from accessing ISP goals', async () => {
      const response = await request(API_URL)
        .get('/api/isp/goals')
        .set('Authorization', `Bearer ${landlordToken}`);

      expect(response.status).toBe(403);
    });
  });
});
