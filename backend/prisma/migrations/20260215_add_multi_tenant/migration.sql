-- Multi-Tenant Migration
-- This migration adds Organization support and tenant isolation

-- Step 1: Create Organizations table
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL UNIQUE,
    "domain" TEXT,
    "logo" TEXT,
    "primary_color" TEXT DEFAULT '#3B82F6',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "plan" TEXT NOT NULL DEFAULT 'basic',
    "max_users" INTEGER NOT NULL DEFAULT 50,
    "max_clients" INTEGER NOT NULL DEFAULT 100,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- Step 2: Create default organization for existing data
INSERT INTO "organizations" (
    "id",
    "name",
    "subdomain",
    "plan",
    "max_users",
    "max_clients",
    "is_active",
    "created_at",
    "updated_at"
) VALUES (
    gen_random_uuid(),
    'Demo Organization',
    'demo',
    'enterprise',
    999,
    999,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Store the default org ID for later use
DO $$
DECLARE
    default_org_id TEXT;
BEGIN
    SELECT id INTO default_org_id FROM "organizations" WHERE subdomain = 'demo';
    
    -- Step 3: Add organization_id column to users table
    ALTER TABLE "users" ADD COLUMN "organization_id" TEXT;
    
    -- Step 4: Migrate existing users to default organization
    UPDATE "users" SET "organization_id" = default_org_id;
    
    -- Step 5: Make organization_id NOT NULL
    ALTER TABLE "users" ALTER COLUMN "organization_id" SET NOT NULL;
    
    -- Step 6: Add organization_id column to clients table
    ALTER TABLE "clients" ADD COLUMN "organization_id" TEXT;
    
    -- Step 7: Migrate existing clients to default organization
    UPDATE "clients" SET "organization_id" = default_org_id;
    
    -- Step 8: Make organization_id NOT NULL
    ALTER TABLE "clients" ALTER COLUMN "organization_id" SET NOT NULL;
    
    -- Step 9: Add organization_id column to form_templates table
    ALTER TABLE "form_templates" ADD COLUMN "organization_id" TEXT;
    
    -- Step 10: Migrate existing form templates to default organization
    UPDATE "form_templates" SET "organization_id" = default_org_id;
    
    -- Step 11: Make organization_id NOT NULL
    ALTER TABLE "form_templates" ALTER COLUMN "organization_id" SET NOT NULL;
    
    -- Step 12: Add organization_id column to audit_logs table (nullable)
    ALTER TABLE "audit_logs" ADD COLUMN "organization_id" TEXT;
    
    -- Step 13: Migrate existing audit logs to default organization
    UPDATE "audit_logs" SET "organization_id" = default_org_id WHERE "user_id" IS NOT NULL;
END $$;

-- Step 14: Drop old unique constraints
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_azure_ad_id_key";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";
ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_ddd_id_key";

-- Step 15: Add new composite unique constraints
ALTER TABLE "users" ADD CONSTRAINT "users_email_organization_id_key" UNIQUE ("email", "organization_id");
ALTER TABLE "users" ADD CONSTRAINT "users_azure_ad_id_organization_id_key" UNIQUE ("azure_ad_id", "organization_id");
ALTER TABLE "clients" ADD CONSTRAINT "clients_ddd_id_organization_id_key" UNIQUE ("ddd_id", "organization_id");

-- Step 16: Add foreign key constraints
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" 
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_fkey" 
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "form_templates" ADD CONSTRAINT "form_templates_organization_id_fkey" 
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" 
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 17: Create indexes for performance
CREATE INDEX "users_organization_id_idx" ON "users"("organization_id");
CREATE INDEX "clients_organization_id_idx" ON "clients"("organization_id");
CREATE INDEX "form_templates_organization_id_idx" ON "form_templates"("organization_id");
CREATE INDEX "audit_logs_organization_id_idx" ON "audit_logs"("organization_id");

-- Step 18: Update updatedAt for organizations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON "organizations" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
