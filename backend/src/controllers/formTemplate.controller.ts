import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { formTemplateService } from '../services/formTemplate.service';

export const formTemplateController = {
  // GET /api/form-templates
  async getTemplates(req: AuthRequest, res: Response) {
    try {
      const { formType } = req.query;
      const organizationId = req.user!.organizationId;
      const templates = await formTemplateService.getTemplates(organizationId, formType as string);
      res.json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  },

  // GET /api/form-templates/:id
  async getTemplateById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = req.user!.organizationId;
      const template = await formTemplateService.getTemplateById(id, organizationId);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      return res.json(template);
    } catch (error) {
      console.error('Error fetching template:', error);
      return res.status(500).json({ error: 'Failed to fetch template' });
    }
  },

  // GET /api/form-templates/default/:formType
  async getDefaultTemplate(req: AuthRequest, res: Response) {
    try {
      const { formType } = req.params;
      const { serviceType } = req.query;
      const organizationId = req.user!.organizationId;
      
      const template = await formTemplateService.getDefaultTemplate(
        organizationId,
        formType,
        serviceType as string
      );
      
      if (!template) {
        return res.status(404).json({ error: 'No default template found' });
      }
      
      return res.json(template);
    } catch (error) {
      console.error('Error fetching default template:', error);
      return res.status(500).json({ error: 'Failed to fetch default template' });
    }
  },

  // POST /api/form-templates
  async createTemplate(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const organizationId = req.user!.organizationId;
      const template = await formTemplateService.createTemplate(organizationId, {
        ...req.body,
        createdBy: userId
      });
      
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  },

  // PUT /api/form-templates/:id
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await formTemplateService.updateTemplate(id, req.body);
      res.json(template);
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  },

  // DELETE /api/form-templates/:id
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await formTemplateService.deleteTemplate(id);
      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  },

  // POST /api/form-templates/:id/sections
  async addSection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const section = await formTemplateService.addSection(id, req.body);
      res.status(201).json(section);
    } catch (error) {
      console.error('Error adding section:', error);
      res.status(500).json({ error: 'Failed to add section' });
    }
  },

  // PUT /api/form-sections/:id
  async updateSection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const section = await formTemplateService.updateSection(id, req.body);
      res.json(section);
    } catch (error) {
      console.error('Error updating section:', error);
      res.status(500).json({ error: 'Failed to update section' });
    }
  },

  // DELETE /api/form-sections/:id
  async deleteSection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await formTemplateService.deleteSection(id);
      res.json({ message: 'Section deleted successfully' });
    } catch (error) {
      console.error('Error deleting section:', error);
      res.status(500).json({ error: 'Failed to delete section' });
    }
  },

  // POST /api/form-sections/:id/fields
  async addField(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const field = await formTemplateService.addField(id, req.body);
      res.status(201).json(field);
    } catch (error) {
      console.error('Error adding field:', error);
      res.status(500).json({ error: 'Failed to add field' });
    }
  },

  // PUT /api/form-fields/:id
  async updateField(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const field = await formTemplateService.updateField(id, req.body);
      res.json(field);
    } catch (error) {
      console.error('Error updating field:', error);
      res.status(500).json({ error: 'Failed to update field' });
    }
  },

  // DELETE /api/form-fields/:id
  async deleteField(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await formTemplateService.deleteField(id);
      res.json({ message: 'Field deleted successfully' });
    } catch (error) {
      console.error('Error deleting field:', error);
      res.status(500).json({ error: 'Failed to delete field' });
    }
  },

  // POST /api/form-responses
  async saveResponse(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const response = await formTemplateService.saveResponse({
        ...req.body,
        userId
      });
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Error saving response:', error);
      res.status(500).json({ error: 'Failed to save response' });
    }
  },

  // PUT /api/form-responses/:id
  async updateResponse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const response = await formTemplateService.updateResponse(id, req.body);
      res.json(response);
    } catch (error) {
      console.error('Error updating response:', error);
      res.status(500).json({ error: 'Failed to update response' });
    }
  },

  // GET /api/form-responses
  async getUserResponses(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { status } = req.query;
      const responses = await formTemplateService.getUserResponses(
        userId,
        status as string
      );
      res.json(responses);
    } catch (error) {
      console.error('Error fetching responses:', error);
      res.status(500).json({ error: 'Failed to fetch responses' });
    }
  },

  // GET /api/form-responses/:id
  async getResponseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const response = await formTemplateService.getResponseById(id);
      
      if (!response) {
        return res.status(404).json({ error: 'Response not found' });
      }
      
      return res.json(response);
    } catch (error) {
      console.error('Error fetching response:', error);
      return res.status(500).json({ error: 'Failed to fetch response' });
    }
  },

  // GET /api/form-responses/submitted/all
  async getSubmittedResponses(req: Request, res: Response) {
    try {
      const { formType } = req.query;
      const responses = await formTemplateService.getSubmittedResponses(formType as string);
      res.json(responses);
    } catch (error) {
      console.error('Error fetching submitted responses:', error);
      res.status(500).json({ error: 'Failed to fetch submitted responses' });
    }
  },

  // POST /api/form-responses/:id/approve
  async approveResponse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { action, comment } = req.body;
      const approverId = (req as any).user?.id;

      if (!approverId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' });
      }

      const response = await formTemplateService.approveFormResponse(
        id,
        approverId,
        action,
        comment
      );

      return res.json(response);
    } catch (error: any) {
      console.error('Error approving response:', error);
      return res.status(500).json({ error: error.message || 'Failed to approve response' });
    }
  },

  // GET /api/form-responses/statistics
  async getStatistics(_req: Request, res: Response) {
    try {
      const stats = await formTemplateService.getFormStatistics();
      return res.json(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
};
