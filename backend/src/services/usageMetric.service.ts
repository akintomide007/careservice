import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UsageMetricService {
  // Record a usage metric
  async recordMetric(data: {
    organizationId: string;
    metricType: 'users' | 'clients' | 'sessions' | 'storage_mb' | 'api_calls';
    value: number;
  }) {
    return await prisma.usageMetric.create({
      data: {
        organizationId: data.organizationId,
        metricType: data.metricType,
        value: data.value,
        recordedAt: new Date()
      }
    });
  }

  // Get organization metrics
  async getOrganizationMetrics(organizationId: string, options?: {
    metricType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const where: any = { organizationId };

    if (options?.metricType) {
      where.metricType = options.metricType;
    }

    if (options?.startDate || options?.endDate) {
      where.recordedAt = {};
      if (options.startDate) {
        where.recordedAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.recordedAt.lte = options.endDate;
      }
    }

    return await prisma.usageMetric.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: options?.limit || 100
    });
  }

  // Get system-wide metrics
  async getSystemMetrics(options?: {
    metricType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (options?.metricType) {
      where.metricType = options.metricType;
    }

    if (options?.startDate || options?.endDate) {
      where.recordedAt = {};
      if (options.startDate) {
        where.recordedAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.recordedAt.lte = options.endDate;
      }
    }

    const metrics = await prisma.usageMetric.findMany({
      where,
      orderBy: { recordedAt: 'desc' }
    });

    // Aggregate by organization
    const byOrganization = metrics.reduce((acc: any, metric) => {
      if (!acc[metric.organizationId]) {
        acc[metric.organizationId] = {};
      }
      if (!acc[metric.organizationId][metric.metricType]) {
        acc[metric.organizationId][metric.metricType] = [];
      }
      acc[metric.organizationId][metric.metricType].push({
        value: metric.value,
        date: metric.recordedAt
      });
      return acc;
    }, {});

    // Calculate totals by metric type
    const totals = metrics.reduce((acc: any, metric) => {
      if (!acc[metric.metricType]) {
        acc[metric.metricType] = 0;
      }
      acc[metric.metricType] += metric.value;
      return acc;
    }, {});

    return {
      byOrganization,
      totals,
      totalRecords: metrics.length
    };
  }

  // Calculate current usage for organization
  async calculateUsage(organizationId: string) {
    // Get latest metrics for each type
    const metricTypes = ['users', 'clients', 'sessions', 'storage_mb', 'api_calls'];
    const latestMetrics: any = {};

    for (const metricType of metricTypes) {
      const latest = await prisma.usageMetric.findFirst({
        where: {
          organizationId,
          metricType
        },
        orderBy: { recordedAt: 'desc' }
      });

      latestMetrics[metricType] = latest?.value || 0;
    }

    // Get organization limits
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        maxUsers: true,
        maxClients: true,
        totalUsers: true,
        totalClients: true,
        storageUsedMB: true
      }
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return {
      current: {
        users: latestMetrics.users,
        clients: latestMetrics.clients,
        sessions: latestMetrics.sessions,
        storage_mb: latestMetrics.storage_mb,
        api_calls: latestMetrics.api_calls
      },
      limits: {
        maxUsers: organization.maxUsers,
        maxClients: organization.maxClients
      },
      usage: {
        usersPercentage: (latestMetrics.users / organization.maxUsers) * 100,
        clientsPercentage: (latestMetrics.clients / organization.maxClients) * 100
      }
    };
  }

  // Track API call
  async trackApiCall(organizationId: string) {
    // Get latest api_calls metric
    const latest = await prisma.usageMetric.findFirst({
      where: {
        organizationId,
        metricType: 'api_calls'
      },
      orderBy: { recordedAt: 'desc' }
    });

    const currentCount = latest?.value || 0;

    // Record new metric
    return await this.recordMetric({
      organizationId,
      metricType: 'api_calls',
      value: currentCount + 1
    });
  }

  // Update storage usage
  async updateStorageUsage(organizationId: string, storageMB: number) {
    // Update organization
    await prisma.organization.update({
      where: { id: organizationId },
      data: { storageUsedMB: storageMB }
    });

    // Record metric
    return await this.recordMetric({
      organizationId,
      metricType: 'storage_mb',
      value: storageMB
    });
  }

  // Auto-update user/client counts
  async updateCounts(organizationId: string) {
    const [userCount, clientCount] = await Promise.all([
      prisma.user.count({ where: { organizationId } }),
      prisma.client.count({ where: { organizationId } })
    ]);

    // Update organization totals
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        totalUsers: userCount,
        totalClients: clientCount
      }
    });

    // Record metrics
    await this.recordMetric({
      organizationId,
      metricType: 'users',
      value: userCount
    });

    await this.recordMetric({
      organizationId,
      metricType: 'clients',
      value: clientCount
    });

    return { userCount, clientCount };
  }

  // Get metrics summary for date range
  async getMetricsSummary(organizationId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const metrics = await this.getOrganizationMetrics(organizationId, {
      startDate,
      limit: 1000
    });

    // Group by metric type
    const byType: any = {};
    metrics.forEach(metric => {
      if (!byType[metric.metricType]) {
        byType[metric.metricType] = [];
      }
      byType[metric.metricType].push({
        value: metric.value,
        date: metric.recordedAt
      });
    });

    // Calculate trends
    const trends: any = {};
    Object.keys(byType).forEach(metricType => {
      const values = byType[metricType];
      if (values.length >= 2) {
        const latest = values[0].value;
        const earliest = values[values.length - 1].value;
        const change = latest - earliest;
        const changePercent = earliest > 0 ? (change / earliest) * 100 : 0;

        trends[metricType] = {
          current: latest,
          previous: earliest,
          change,
          changePercent: Math.round(changePercent * 10) / 10,
          trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        };
      } else if (values.length === 1) {
        trends[metricType] = {
          current: values[0].value,
          previous: 0,
          change: values[0].value,
          changePercent: 0,
          trend: 'new'
        };
      }
    });

    return {
      period: {
        days,
        startDate,
        endDate: new Date()
      },
      byType,
      trends
    };
  }

  // Delete old metrics (cleanup)
  async deleteOldMetrics(daysToKeep: number = 90) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await prisma.usageMetric.deleteMany({
      where: {
        recordedAt: {
          lt: cutoffDate
        }
      }
    });

    return {
      deleted: result.count,
      cutoffDate
    };
  }
}

export default new UsageMetricService();
