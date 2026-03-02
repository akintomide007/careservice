import { Router } from 'express';
import { authenticate, requireManager } from '../middleware/auth';
import { appointmentRequestController } from '../controllers/appointmentRequest.controller';
import { appointmentCalendarController } from '../controllers/appointmentCalendar.controller';

const router = Router();

// DSP/Manager can create appointment requests
router.post('/', authenticate, appointmentRequestController.createRequest);

// Calendar endpoints (before :id routes to avoid conflicts)
router.get('/calendar', authenticate, appointmentCalendarController.getCalendarAppointments);
router.get('/available-dsps', authenticate, appointmentCalendarController.getAvailableDsps);
router.post('/check-availability', authenticate, appointmentCalendarController.checkAvailability);
router.post('/recurring', authenticate, requireManager, appointmentCalendarController.createRecurring);

// All authenticated users can view (filtered by controller)
router.get('/', authenticate, appointmentRequestController.getRequests);
router.get('/statistics', authenticate, appointmentRequestController.getStatistics);
router.get('/:id', authenticate, appointmentRequestController.getRequestById);

// Requester can update their own request (checked in controller)
router.put('/:id', authenticate, appointmentRequestController.updateRequest);

// Calendar-specific appointment operations
router.post('/:id/assign-dsp', authenticate, requireManager, appointmentCalendarController.assignDsp);
router.post('/:id/check-conflicts', authenticate, appointmentCalendarController.checkConflicts);
router.put('/:id/reschedule', authenticate, requireManager, appointmentCalendarController.rescheduleAppointment);

// Only managers can approve/reject (staff supervision)
router.post('/:id/approve', authenticate, requireManager, appointmentRequestController.approveRequest);
router.post('/:id/reject', authenticate, requireManager, appointmentRequestController.rejectRequest);

// Requester can cancel (checked in controller)
router.post('/:id/cancel', authenticate, appointmentRequestController.cancelRequest);

export default router;
