import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://careuser:carepass@localhost:5432/care_provider_db'
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10)
  },
  
  microsoft: {
    useMock: process.env.USE_MOCK_MS365 === 'true',
    azureAd: {
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AZURE_AD_TENANT_ID || '',
      redirectUri: process.env.AZURE_AD_REDIRECT_URI || 'http://localhost:3001/auth/callback'
    },
    graph: {
      baseUrl: process.env.GRAPH_API_BASE || 'https://graph.microsoft.com/v1.0'
    },
    sharepoint: {
      siteUrl: process.env.SHAREPOINT_SITE_URL || ''
    },
    mockDelayMs: parseInt(process.env.MOCK_DELAY_MS || '500', 10)
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:19006']
  }
};
