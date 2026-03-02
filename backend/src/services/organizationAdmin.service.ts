import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createDefaultFormTemplates } from '../utils/createDefaultFormTemplates';

const prisma = new PrismaClient();

export class OrganizationAdminService {
  // Get all organizations with stats
  async getAllOrganizations(filters?: {
    status?: string;
    searchTerm?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.billingStatus = filters.status;
    }

    if (filters?.searchTerm) {
      where.OR = [
        { name: { contains: filters.searchTerm, mode: 'insensitive' } },
        { subdomain: { contains: filters.searchTerm, mode: 'insensitive' } },
        { billingEmail: { contains: filters.searchTerm, mode: 'insensitive' } }
      ];
    }

    const organizations = await prisma.organization.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return organizations.map(org => ({
      ...org,
      stats: {
        totalUsers: org._count.users,
        totalClients: org._count.clients
      }
    }));
  }

  // Get organization by ID with detailed stats
  async getOrganizationById(id: string) {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        },
        clients: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            isActive: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            users: true,
            clients: true
          }
        }
      }
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Get recent usage metrics
    const recentMetrics = await prisma.usageMetric.findMany({
      where: { organizationId: id },
      orderBy: { recordedAt: 'desc' },
      take: 30
    });

    // Get support tickets
    const tickets = await prisma.supportTicket.findMany({
      where: { organizationId: id },
      include: {
        reporter: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return {
      ...organization,
      metrics: recentMetrics,
      recentTickets: tickets,
      stats: {
        totalUsers: organization._count.users,
        totalClients: organization._count.clients
      }
    };
  }

  // Create new organization (onboarding)
  async createOrganization(data: {
    name: string;
    subdomain: string;
    plan?: string;
    maxUsers?: number;
    maxClients?: number;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    billingEmail?: string;
    subscriptionPlan?: string;
    storageLimit?: number;
    adminEmail?: string;
    adminPassword?: string;
    branding?: {
      logoUrl?: string;
      primaryColor?: string;
      customDomain?: string;
    };
    adminUser?: {
      name: string;
      email: string;
      password: string;
    };
  }) {
    // Check if subdomain is available
    const existingOrg = await prisma.organization.findUnique({
      where: { subdomain: data.subdomain }
    });

    if (existingOrg) {
      throw new Error('Subdomain already taken');
    }

    // Auto-generate admin user if not provided
    // Check both adminEmail/adminPassword fields and adminUser object for flexibility
    const adminEmail = data.adminEmail || data.adminUser?.email || `admin@${data.subdomain}.careservice.com`;
    const adminPassword = data.adminPassword || data.adminUser?.password || `${data.subdomain}Admin123!`;
    const adminName = data.adminUser?.name || `${data.name} Admin`;

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create organization with initial admin user
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        subdomain: data.subdomain,
        plan: data.plan || data.subscriptionPlan || 'basic',
        maxUsers: data.maxUsers || 50,
        maxClients: data.maxClients || 100,
        billingEmail: data.billingEmail || data.contactEmail || adminEmail,
        billingStatus: 'active',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        totalUsers: 1,
        totalClients: 0,
        storageUsedMB: 0,
        users: {
          create: {
            azureAdId: `local_${adminEmail}_${Date.now()}`,
            firstName: adminName.split(' ')[0] || adminName,
            lastName: adminName.split(' ').slice(1).join(' ') || '',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            isLandlord: false
          }
        }
      },
      include: {
        users: true
      }
    });

    // Record initial metrics
    await this.recordInitialMetrics(organization.id);

    // Create default form templates for new organization
    await createDefaultFormTemplates(organization.id);

    return {
      ...organization,
      initialCredentials: {
        email: adminEmail,
        password: adminPassword,
        message: 'Please save these credentials and share them with the organization admin'
      }
    };
  }

  // Update organization settings
  async updateOrganization(id: string, data: {
    name?: string;
    subdomain?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    billingEmail?: string;
    billingStatus?: string;
    subscriptionStart?: Date;
    subscriptionEnd?: Date;
  }) {
    // If updating subdomain, check availability
    if (data.subdomain) {
      const existingOrg = await prisma.organization.findFirst({
        where: {
          subdomain: data.subdomain,
          NOT: { id }
        }
      });

      if (existingOrg) {
        throw new Error('Subdomain already taken');
      }
    }

    return await prisma.organization.update({
      where: { id },
      data: {
        ...data,
        lastActivityAt: new Date()
      }
    });
  }

  // Suspend organization
  async suspendOrganization(id: string, reason?: string) {
    const organization = await prisma.organization.update({
      where: { id },
      data: {
        billingStatus: 'suspended',
        lastActivityAt: new Date()
      }
    });

    // Deactivate all users in organization
    await prisma.user.updateMany({
      where: { organizationId: id },
      data: { isActive: false }
    });

    // Create a support ticket for the suspension
    if (reason) {
      await prisma.supportTicket.create({
        data: {
          organizationId: id,
          title: 'Organization Suspended',
          description: reason,
          priority: 'high',
          status: 'open',
          category: 'technical',
          reportedBy: 'system'
        }
      });
    }

    return organization;
  }

  // Activate organization
  async activateOrganization(id: string) {
    const organization = await prisma.organization.update({
      where: { id },
      data: {
        billingStatus: 'active',
        lastActivityAt: new Date()
      }
    });

    // Reactivate all users in organization
    await prisma.user.updateMany({
      where: { organizationId: id },
      data: { isActive: true }
    });

    return organization;
  }

  // Soft delete organization
  async deleteOrganization(id: string) {
    return await prisma.organization.update({
      where: { id },
      data: {
        billingStatus: 'cancelled',
        lastActivityAt: new Date()
      }
    });
  }

  // Get organization statistics
  async getOrganizationStats(id: string) {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
            formTemplates: true
          }
        }
      }
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    // Get metrics over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentMetrics = await prisma.usageMetric.findMany({
      where: {
        organizationId: id,
        recordedAt: { gte: thirtyDaysAgo }
      },
      orderBy: { recordedAt: 'asc' }
    });

    // Calculate trends
    const metricsByType = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.metricType]) {
        acc[metric.metricType] = [];
      }
      acc[metric.metricType].push({
        value: metric.value,
        date: metric.recordedAt
      });
      return acc;
    }, {} as Record<string, Array<{ value: number; date: Date }>>);

    return {
      current: {
        totalUsers: org._count.users,
        totalClients: org._count.clients,
        totalFormTemplates: org._count.formTemplates,
        storageUsedMB: org.storageUsedMB
      },
      trends: metricsByType,
      billing: {
        status: org.billingStatus,
        subscriptionStart: org.subscriptionStart,
        subscriptionEnd: org.subscriptionEnd,
        daysRemaining: org.subscriptionEnd
          ? Math.floor((org.subscriptionEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null
      }
    };
  }

  // Record initial metrics for new organization
  private async recordInitialMetrics(organizationId: string) {
    const now = new Date();
    const metrics = [
      { metricType: 'users', value: 1 },
      { metricType: 'clients', value: 0 },
      { metricType: 'sessions', value: 0 },
      { metricType: 'storage_mb', value: 0 },
      { metricType: 'api_calls', value: 0 }
    ];

    for (const metric of metrics) {
      await prisma.usageMetric.create({
        data: {
          organizationId,
          metricType: metric.metricType,
          value: metric.value,
          recordedAt: now
        }
      });
    }
  }

  // Get system-wide overview
  async getSystemOverview() {
    const totalOrgs = await prisma.organization.count();
    const activeOrgs = await prisma.organization.count({
      where: { billingStatus: 'active' }
    });
    const suspendedOrgs = await prisma.organization.count({
      where: { billingStatus: 'suspended' }
    });
    const totalUsers = await prisma.user.count();
    const totalClients = await prisma.client.count();

    const openTickets = await prisma.supportTicket.count({
      where: { status: { in: ['open', 'in_progress'] } }
    });

    return {
      organizations: {
        total: totalOrgs,
        active: activeOrgs,
        suspended: suspendedOrgs,
        cancelled: totalOrgs - activeOrgs - suspendedOrgs
      },
      users: totalUsers,
      clients: totalClients,
      support: {
        openTickets
      }
    };
  }
}

export default new OrganizationAdminService();