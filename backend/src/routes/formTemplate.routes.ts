import { Router } from 'express';
import { formTemplateController } from '../controllers/formTemplate.controller';
import { authenticate, requireManager, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Template routes - All can view, Admin creates/manages (organization management)
router.get('/form-templates', formTemplateController.getTemplates);
router.get('/form-templates/default/:formType', formTemplateController.getDefaultTemplate);
router.get('/form-templates/:id', formTemplateController.getTemplateById);
router.post('/form-templates', requireRole('admin'), formTemplateController.createTemplate);
router.put('/form-templates/:id', requireRole('admin'), formTemplateController.updateTemplate);
router.delete('/form-templates/:id', requireRole('admin'), formTemplateController.deleteTemplate);

// Section routes - Admin only (template building)
router.post('/form-templates/:id/sections', requireRole('admin'), formTemplateController.addSection);
router.put('/form-sections/:id', requireRole('admin'), formTemplateController.updateSection);
router.delete('/form-sections/:id', requireRole('admin'), formTemplateController.deleteSection);

// Field routes - Admin only (template building)
router.post('/form-sections/:id/fields', requireRole('admin'), formTemplateController.addField);
router.put('/form-fields/:id', requireRole('admin'), formTemplateController.updateField);
router.delete('/form-fields/:id', requireRole('admin'), formTemplateController.deleteField);

// Response routes
router.get('/form-responses/submitted/all', formTemplateController.getSubmittedResponses);
router.get('/form-responses/statistics', formTemplateController.getStatistics);
// Only managers can approve/reject forms (staff supervision)
router.post('/form-responses/:id/approve', requireManager, formTemplateController.approveResponse);
router.get('/form-responses', formTemplateController.getUserResponses);
router.get('/form-responses/:id', formTemplateController.getResponseById);
router.post('/form-responses', formTemplateController.saveResponse);
router.put('/form-responses/:id', formTemplateController.updateResponse);

export default router;
