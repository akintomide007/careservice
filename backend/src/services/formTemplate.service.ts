import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const formTemplateService = {
  // Get all active templates
  async getTemplates(formType?: string) {
    return prisma.formTemplate.findMany({
      where: {
        isActive: true,
        ...(formType && { formType })
      },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            fields: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Get template by ID with full details
  async getTemplateById(id: string) {
    return prisma.formTemplate.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            fields: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });
  },

  // Get default template for a form type
  async getDefaultTemplate(formType: string, serviceType?: string) {
    return prisma.formTemplate.findFirst({
      where: {
        formType,
        isActive: true,
        isDefault: true,
        ...(serviceType && { serviceType })
      },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            fields: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });
  },

  // Create new template
  async createTemplate(data: any) {
    return prisma.formTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        formType: data.formType,
        serviceType: data.serviceType,
        isActive: data.isActive ?? true,
        isDefault: data.isDefault ?? false,
        createdBy: data.createdBy,
        sections: {
          create: data.sections?.map((section: any, index: number) => ({
            title: section.title,
            description: section.description,
            orderIndex: section.orderIndex ?? index + 1,
            isRepeatable: section.isRepeatable ?? false,
            maxRepeat: section.maxRepeat,
            isRequired: section.isRequired ?? true,
            fields: {
              create: section.fields?.map((field: any, fieldIndex: number) => ({
                label: field.label,
                fieldType: field.fieldType,
                orderIndex: field.orderIndex ?? fieldIndex + 1,
                isRequired: field.isRequired ?? false,
                options: field.options,
                validation: field.validation,
                placeholder: field.placeholder,
                helpText: field.helpText,
                defaultValue: field.defaultValue
              }))
            }
          }))
        }
      },
      include: {
        sections: {
          include: {
            fields: true
          }
        }
      }
    });
  },

  // Update template
  async updateTemplate(id: string, data: any) {
    return prisma.formTemplate.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        serviceType: data.serviceType,
        isActive: data.isActive,
        isDefault: data.isDefault,
        version: { increment: 1 }
      },
      include: {
        sections: {
          include: {
            fields: true
          }
        }
      }
    });
  },

  // Delete template (soft delete by setting isActive to false)
  async deleteTemplate(id: string) {
    return prisma.formTemplate.update({
      where: { id },
      data: { isActive: false }
    });
  },

  // Save form response
  async saveResponse(data: any) {
    return prisma.formResponse.create({
      data: {
        templateId: data.templateId,
        userId: data.userId,
        progressNoteId: data.progressNoteId,
        incidentReportId: data.incidentReportId,
        responseData: data.responseData,
        status: data.status || 'draft',
        submittedAt: data.status === 'submitted' ? new Date() : null
      }
    });
  },

  // Update form response
  async updateResponse(id: string, data: any) {
    return prisma.formResponse.update({
      where: { id },
      data: {
        responseData: data.responseData,
        status: data.status,
        submittedAt: data.status === 'submitted' ? new Date() : undefined
      }
    });
  },

  // Get user's form responses
  async getUserResponses(userId: string, status?: string) {
    return prisma.formResponse.findMany({
      where: {
        userId,
        ...(status && { status })
      },
      include: {
        template: true
      },
      orderBy: { updatedAt: 'desc' }
    });
  },

  // Get form response by ID
  async getResponseById(id: string) {
    return prisma.formResponse.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            sections: {
              include: {
                fields: true
              }
            }
          }
        }
      }
    });
  },

  // Add section to template
  async addSection(templateId: string, sectionData: any) {
    return prisma.formSection.create({
      data: {
        templateId,
        title: sectionData.title,
        description: sectionData.description,
        orderIndex: sectionData.orderIndex,
        isRepeatable: sectionData.isRepeatable ?? false,
        maxRepeat: sectionData.maxRepeat,
        isRequired: sectionData.isRequired ?? true,
        fields: {
          create: sectionData.fields?.map((field: any, index: number) => ({
            label: field.label,
            fieldType: field.fieldType,
            orderIndex: field.orderIndex ?? index + 1,
            isRequired: field.isRequired ?? false,
            options: field.options,
            validation: field.validation,
            placeholder: field.placeholder,
            helpText: field.helpText,
            defaultValue: field.defaultValue
          }))
        }
      },
      include: {
        fields: true
      }
    });
  },

  // Update section
  async updateSection(sectionId: string, data: any) {
    return prisma.formSection.update({
      where: { id: sectionId },
      data: {
        title: data.title,
        description: data.description,
        orderIndex: data.orderIndex,
        isRepeatable: data.isRepeatable,
        maxRepeat: data.maxRepeat,
        isRequired: data.isRequired
      }
    });
  },

  // Delete section
  async deleteSection(sectionId: string) {
    return prisma.formSection.delete({
      where: { id: sectionId }
    });
  },

  // Add field to section
  async addField(sectionId: string, fieldData: any) {
    return prisma.formField.create({
      data: {
        sectionId,
        label: fieldData.label,
        fieldType: fieldData.fieldType,
        orderIndex: fieldData.orderIndex,
        isRequired: fieldData.isRequired ?? false,
        options: fieldData.options,
        validation: fieldData.validation,
        placeholder: fieldData.placeholder,
        helpText: fieldData.helpText,
        defaultValue: fieldData.defaultValue
      }
    });
  },

  // Update field
  async updateField(fieldId: string, data: any) {
    return prisma.formField.update({
      where: { id: fieldId },
      data: {
        label: data.label,
        fieldType: data.fieldType,
        orderIndex: data.orderIndex,
        isRequired: data.isRequired,
        options: data.options,
        validation: data.validation,
        placeholder: data.placeholder,
        helpText: data.helpText,
        defaultValue: data.defaultValue
      }
    });
  },

  // Delete field
  async deleteField(fieldId: string) {
    return prisma.formField.delete({
      where: { id: fieldId }
    });
  },

  // Get all submitted form responses (for manager approval)
  async getSubmittedResponses(formType?: string) {
    return prisma.formResponse.findMany({
      where: {
        status: 'submitted',
        ...(formType && {
          template: {
            formType
          }
        })
      },
      include: {
        template: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });
  },

  // Approve form response
  async approveFormResponse(responseId: string, approverId: string, action: 'approve' | 'reject', comment?: string) {
    const response = await prisma.formResponse.findUnique({
      where: { id: responseId },
      include: { template: true }
    });

    if (!response) {
      throw new Error('Form response not found');
    }

    // Parse existing response data and add approval metadata
    const existingData = response.responseData as Record<string, any> || {};
    const updatedData = {
      ...existingData,
      _approval: {
        action,
        approverId,
        approvedAt: new Date().toISOString(),
        comment
      }
    };

    // Update the response status
    const updatedResponse = await prisma.formResponse.update({
      where: { id: responseId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        responseData: updatedData
      },
      include: {
        template: true,
        user: true
      }
    });

    return updatedResponse;
  },

  // Get form response statistics
  async getFormStatistics() {
    const [
      totalSubmitted,
      totalApproved,
      totalRejected,
      byFormType,
      recentSubmissions
    ] = await Promise.all([
      prisma.formResponse.count({ where: { status: 'submitted' } }),
      prisma.formResponse.count({ where: { status: 'approved' } }),
      prisma.formResponse.count({ where: { status: 'rejected' } }),
      prisma.formResponse.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.formResponse.findMany({
        where: { status: 'submitted' },
        take: 10,
        orderBy: { submittedAt: 'desc' },
        include: {
          template: { select: { name: true, formType: true } },
          user: { select: { firstName: true, lastName: true } }
        }
      })
    ]);

    return {
      totalSubmitted,
      totalApproved,
      totalRejected,
      byFormType,
      recentSubmissions
    };
  }
};
