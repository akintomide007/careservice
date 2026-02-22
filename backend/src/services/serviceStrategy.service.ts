import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const serviceStrategyService = {
  // Get all service strategies for an organization
  async getStrategies(organizationId: string, category?: string) {
    return prisma.serviceStrategy.findMany({
      where: {
        organizationId,
        isActive: true,
        ...(category && { category })
      },
      orderBy: [
        { category: 'asc' },
        { orderIndex: 'asc' }
      ]
    });
  },

  // Get strategies by category
  async getStrategiesByCategory(organizationId: string) {
    const strategies = await prisma.serviceStrategy.findMany({
      where: {
        organizationId,
        isActive: true
      },
      orderBy: [
        { category: 'asc' },
        { orderIndex: 'asc' }
      ]
    });

    // Group by category
    const grouped = strategies.reduce((acc: any, strategy) => {
      if (!acc[strategy.category]) {
        acc[strategy.category] = [];
      }
      acc[strategy.category].push(strategy);
      return acc;
    }, {});

    return grouped;
  },

  // Get strategy by ID
  async getStrategyById(id: string, organizationId: string) {
    return prisma.serviceStrategy.findFirst({
      where: {
        id,
        organizationId
      }
    });
  },

  // Create new strategy
  async createStrategy(data: {
    organizationId: string;
    category: string;
    name: string;
    description?: string;
    orderIndex?: number;
  }) {
    // Get max order index for the category
    const maxOrder = await prisma.serviceStrategy.aggregate({
      where: {
        organizationId: data.organizationId,
        category: data.category
      },
      _max: { orderIndex: true }
    });

    return prisma.serviceStrategy.create({
      data: {
        organizationId: data.organizationId,
        category: data.category,
        name: data.name,
        description: data.description,
        isActive: true,
        orderIndex: data.orderIndex || (maxOrder._max.orderIndex || 0) + 1
      }
    });
  },

  // Update strategy
  async updateStrategy(id: string, data: {
    name?: string;
    description?: string;
    orderIndex?: number;
    isActive?: boolean;
  }) {
    return prisma.serviceStrategy.update({
      where: { id },
      data
    });
  },

  // Delete strategy (soft delete)
  async deleteStrategy(id: string) {
    return prisma.serviceStrategy.update({
      where: { id },
      data: { isActive: false }
    });
  },

  // Reorder strategies within a category
  async reorderStrategies(organizationId: string, category: string, orderedIds: string[]) {
    const updates = orderedIds.map((id, index) => 
      prisma.serviceStrategy.update({
        where: { id },
        data: { orderIndex: index + 1 }
      })
    );

    await prisma.$transaction(updates);

    return this.getStrategies(organizationId, category);
  },

  // Seed default strategies for a new organization
  async seedDefaultStrategies(organizationId: string) {
    const defaultStrategies = [
      // Behavioral Support Strategies
      { category: 'behavioral_support', name: 'Positive Reinforcement', description: 'Use positive reinforcement techniques' },
      { category: 'behavioral_support', name: 'Redirection', description: 'Redirect attention to appropriate activity' },
      { category: 'behavioral_support', name: 'Choice Offering', description: 'Offer choices to increase autonomy' },
      { category: 'behavioral_support', name: 'Environmental Modification', description: 'Modify environment to reduce triggers' },
      { category: 'behavioral_support', name: 'Break Provision', description: 'Provide scheduled breaks' },
      
      // Communication Strategies
      { category: 'communication', name: 'Visual Supports', description: 'Use visual aids and schedules' },
      { category: 'communication', name: 'Simple Language', description: 'Use clear, simple language' },
      { category: 'communication', name: 'Active Listening', description: 'Practice active listening techniques' },
      { category: 'communication', name: 'AAC Device', description: 'Use augmentative and alternative communication' },
      { category: 'communication', name: 'Social Stories', description: 'Use social stories for understanding' },
      
      // Social Skills Strategies
      { category: 'social_skills', name: 'Modeling', description: 'Model appropriate social behavior' },
      { category: 'social_skills', name: 'Role Playing', description: 'Practice through role-play scenarios' },
      { category: 'social_skills', name: 'Social Scripts', description: 'Provide scripted social interactions' },
      { category: 'social_skills', name: 'Peer Interaction', description: 'Facilitate peer interactions' },
      { category: 'social_skills', name: 'Group Activities', description: 'Engage in structured group activities' },
      
      // Daily Living Skills
      { category: 'daily_living', name: 'Task Analysis', description: 'Break tasks into smaller steps' },
      { category: 'daily_living', name: 'Hand-over-Hand', description: 'Provide physical guidance' },
      { category: 'daily_living', name: 'Chaining', description: 'Use forward or backward chaining' },
      { category: 'daily_living', name: 'Visual Schedules', description: 'Use visual task schedules' },
      { category: 'daily_living', name: 'Adaptive Equipment', description: 'Utilize adaptive equipment' },
      
      // Vocational Skills
      { category: 'vocational', name: 'Job Coaching', description: 'Provide on-site job coaching' },
      { category: 'vocational', name: 'Task Modification', description: 'Modify tasks for success' },
      { category: 'vocational', name: 'Time Management', description: 'Teach time management skills' },
      { category: 'vocational', name: 'Work Social Skills', description: 'Practice workplace social skills' },
      { category: 'vocational', name: 'Safety Training', description: 'Provide workplace safety training' },
      
      // Health & Wellness
      { category: 'health_wellness', name: 'Medication Monitoring', description: 'Monitor medication compliance' },
      { category: 'health_wellness', name: 'Exercise Program', description: 'Implement exercise activities' },
      { category: 'health_wellness', name: 'Nutrition Education', description: 'Provide nutrition guidance' },
      { category: 'health_wellness', name: 'Sleep Hygiene', description: 'Support healthy sleep habits' },
      { category: 'health_wellness', name: 'Stress Management', description: 'Teach stress reduction techniques' },
      
      // Community Integration
      { category: 'community_integration', name: 'Community Outings', description: 'Facilitate community activities' },
      { category: 'community_integration', name: 'Public Transportation', description: 'Practice using public transit' },
      { category: 'community_integration', name: 'Money Management', description: 'Teach money handling skills' },
      { category: 'community_integration', name: 'Community Resources', description: 'Connect with community resources' },
      { category: 'community_integration', name: 'Social Recreation', description: 'Participate in recreational activities' }
    ];

    const strategies = defaultStrategies.map((strategy, index) => ({
      organizationId,
      category: strategy.category,
      name: strategy.name,
      description: strategy.description,
      isActive: true,
      orderIndex: index + 1
    }));

    return prisma.serviceStrategy.createMany({
      data: strategies
    });
  }
};
