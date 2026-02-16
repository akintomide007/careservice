import { Router } from 'express';
import { formTemplateController } from '../controllers/formTemplate.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Template routes
router.get('/form-templates', formTemplateController.getTemplates);
router.get('/form-templates/default/:formType', formTemplateController.getDefaultTemplate);
router.get('/form-templates/:id', formTemplateController.getTemplateById);
router.post('/form-templates', formTemplateController.createTemplate);
router.put('/form-templates/:id', formTemplateController.updateTemplate);
router.delete('/form-templates/:id', formTemplateController.deleteTemplate);

// Section routes
router.post('/form-templates/:id/sections', formTemplateController.addSection);
router.put('/form-sections/:id', formTemplateController.updateSection);
router.delete('/form-sections/:id', formTemplateController.deleteSection);

// Field routes
router.post('/form-sections/:id/fields', formTemplateController.addField);
router.put('/form-fields/:id', formTemplateController.updateField);
router.delete('/form-fields/:id', formTemplateController.deleteField);

// Response routes
router.get('/form-responses/submitted/all', formTemplateController.getSubmittedResponses);
router.get('/form-responses/statistics', formTemplateController.getStatistics);
// Only managers and admins can approve/reject forms
router.post('/form-responses/:id/approve', authorize('manager', 'admin'), formTemplateController.approveResponse);
router.get('/form-responses', formTemplateController.getUserResponses);
router.get('/form-responses/:id', formTemplateController.getResponseById);
router.post('/form-responses', formTemplateController.saveResponse);
router.put('/form-responses/:id', formTemplateController.updateResponse);

export default router;
