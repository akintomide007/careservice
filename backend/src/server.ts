import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import sessionRoutes from './routes/session.routes';
import progressNoteRoutes from './routes/progressNote.routes';
import incidentRoutes from './routes/incident.routes';
import formTemplateRoutes from './routes/formTemplate.routes';
import taskRoutes from './routes/task.routes';
import violationRoutes from './routes/violation.routes';
import serviceStrategyRoutes from './routes/serviceStrategy.routes';
import scheduleRoutes from './routes/schedule.routes';
import appointmentRequestRoutes from './routes/appointmentRequest.routes';
import adminRoutes from './routes/admin.routes';
import supportRoutes from './routes/support.routes';
import notificationRoutes from './routes/notification.routes';
import ispGoalRoutes from './routes/ispGoal.routes';
import ispOutcomeRoutes from './routes/ispOutcome.routes';
import assignmentRoutes from './routes/assignment.routes';
import transcriptionRoutes from './routes/transcription.routes';
import organizationSettingsRoutes from './routes/organizationSettings.routes';

const app = express();

// CORS must come before helmet
app.use(cors({ 
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight for 10 minutes
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress-notes', progressNoteRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api', formTemplateRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/service-strategies', serviceStrategyRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/appointment-requests', appointmentRequestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/isp-goals', ispGoalRoutes);
app.use('/api/isp-outcomes', ispOutcomeRoutes);
app.use('/api', assignmentRoutes);
app.use('/api', transcriptionRoutes);
app.use('/api/organization', organizationSettingsRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.env}`);
  console.log(`Mock MS365: ${config.microsoft.useMock}`);
});
