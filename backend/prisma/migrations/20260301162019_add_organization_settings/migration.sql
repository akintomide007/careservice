-- CreateTable
CREATE TABLE "organization_settings" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "logo_url" TEXT,
    "print_logo_url" TEXT,
    "favicon_url" TEXT,
    "primary_color" TEXT NOT NULL DEFAULT '#3B82F6',
    "secondary_color" TEXT NOT NULL DEFAULT '#10B981',
    "accent_color" TEXT NOT NULL DEFAULT '#8B5CF6',
    "font_family" TEXT NOT NULL DEFAULT 'Inter',
    "company_name" TEXT NOT NULL,
    "tagline" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "enabled_modules" JSONB NOT NULL DEFAULT '[]',
    "dashboard_layout" JSONB,
    "form_templates" JSONB,
    "email_templates" JSONB,
    "print_styles" JSONB,
    "terms_of_service" TEXT,
    "privacy_policy" TEXT,
    "consent_forms" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_settings_organization_id_key" ON "organization_settings"("organization_id");

-- AddForeignKey
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
