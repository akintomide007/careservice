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

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
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

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.env}`);
  console.log(`Mock MS365: ${config.microsoft.useMock}`);
});
