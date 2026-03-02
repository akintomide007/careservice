import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getOrganizationSettings(organizationId: string) {
  let settings = await prisma.organizationSettings.findUnique({
    where: { organizationId },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          subdomain: true,
          logo: true,
          primaryColor: true
        }
      }
    }
  });

  // If no settings exist, create default settings
  if (!settings) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    settings = await prisma.organizationSettings.create({
      data: {
        organizationId,
        companyName: organization.name,
        primaryColor: organization.primaryColor || '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#8B5CF6',
        fontFamily: 'Inter',
        enabledModules: []
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logo: true,
            primaryColor: true
          }
        }
      }
    });
  }

  return settings;
}

export async function updateOrganizationSettings(
  organizationId: string,
  data: {
    logoUrl?: string;
    printLogoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    companyName?: string;
    tagline?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    website?: string;
    enabledModules?: string[];
    dashboardLayout?: any;
    formTemplates?: any;
    emailTemplates?: any;
    printStyles?: any;
    termsOfService?: string;
    privacyPolicy?: string;
    consentForms?: any;
  }
) {
  // Ensure settings exist first
  await getOrganizationSettings(organizationId);

  const updateData: any = {};
  
  // Only include fields that are provided
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
  if (data.printLogoUrl !== undefined) updateData.printLogoUrl = data.printLogoUrl;
  if (data.faviconUrl !== undefined) updateData.faviconUrl = data.faviconUrl;
  if (data.primaryColor !== undefined) updateData.primaryColor = data.primaryColor;
  if (data.secondaryColor !== undefined) updateData.secondaryColor = data.secondaryColor;
  if (data.accentColor !== undefined) updateData.accentColor = data.accentColor;
  if (data.fontFamily !== undefined) updateData.fontFamily = data.fontFamily;
  if (data.companyName !== undefined) updateData.companyName = data.companyName;
  if (data.tagline !== undefined) updateData.tagline = data.tagline;
  if (data.addressLine1 !== undefined) updateData.addressLine1 = data.addressLine1;
  if (data.addressLine2 !== undefined) updateData.addressLine2 = data.addressLine2;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.zipCode !== undefined) updateData.zipCode = data.zipCode;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.enabledModules !== undefined) updateData.enabledModules = data.enabledModules;
  if (data.dashboardLayout !== undefined) updateData.dashboardLayout = data.dashboardLayout;
  if (data.formTemplates !== undefined) updateData.formTemplates = data.formTemplates;
  if (data.emailTemplates !== undefined) updateData.emailTemplates = data.emailTemplates;
  if (data.printStyles !== undefined) updateData.printStyles = data.printStyles;
  if (data.termsOfService !== undefined) updateData.termsOfService = data.termsOfService;
  if (data.privacyPolicy !== undefined) updateData.privacyPolicy = data.privacyPolicy;
  if (data.consentForms !== undefined) updateData.consentForms = data.consentForms;

  return prisma.organizationSettings.update({
    where: { organizationId },
    data: updateData,
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          subdomain: true,
          logo: true,
          primaryColor: true
        }
      }
    }
  });
}

export async function uploadLogo(
  organizationId: string,
  logoType: 'logo' | 'printLogo' | 'favicon',
  file: Express.Multer.File
) {
  // In production, upload to S3/Azure Blob/etc.
  // For now, we'll store locally in uploads folder
  const fileName = `${organizationId}-${logoType}-${Date.now()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`;
  const filePath = `/uploads/logos/${fileName}`;

  // Update settings with new logo URL
  const fieldMap = {
    logo: 'logoUrl',
    printLogo: 'printLogoUrl',
    favicon: 'faviconUrl'
  };

  await updateOrganizationSettings(organizationId, {
    [fieldMap[logoType]]: filePath
  } as any);

  return {
    url: filePath,
    fileName
  };
}
