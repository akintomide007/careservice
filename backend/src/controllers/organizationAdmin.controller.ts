import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import organizationAdminService from '../services/organizationAdmin.service';

export class OrganizationAdminController {
  // Get all organizations
  async getAllOrganizations(req: Request, res: Response) {
    try {
      const { status, searchTerm } = req.query;

      const organizations = await organizationAdminService.getAllOrganizations({
        status: status as string,
        searchTerm: searchTerm as string
      });

      res.json(organizations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get organization by ID
  async getOrganizationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organization = await organizationAdminService.getOrganizationById(id);
      res.json(organization);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // Create new organization
  async createOrganization(req: Request, res: Response) {
    try {
      const organization = await organizationAdminService.createOrganization(req.body);
      res.status(201).json(organization);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update organization
  async updateOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organization = await organizationAdminService.updateOrganization(id, req.body);
      res.json(organization);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Suspend organization
  async suspendOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const organization = await organizationAdminService.suspendOrganization(id, reason);
      res.json(organization);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Activate organization
  async activateOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organization = await organizationAdminService.activateOrganization(id);
      res.json(organization);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete organization
  async deleteOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organization = await organizationAdminService.deleteOrganization(id);
      res.json(organization);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get organization statistics
  async getOrganizationStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await organizationAdminService.getOrganizationStats(id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get system overview
  async getSystemOverview(_req: AuthRequest, res: Response) {
    try {
      const overview = await organizationAdminService.getSystemOverview();
      res.json(overview);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new OrganizationAdminController();
