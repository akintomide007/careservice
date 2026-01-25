import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  azureAdId: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface ClockInData {
  clientId: string;
  serviceType: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

export interface ClockOutData {
  sessionId: string;
  latitude?: number;
  longitude?: number;
}

export interface ProgressNoteInput {
  sessionId?: string;
  clientId: string;
  serviceType: string;
  serviceDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  ispOutcomeId?: string;
  reasonForService?: string;
  supportsProvided?: string;
  individualResponse?: {
    engagement?: string;
    affect?: string;
    communication?: string;
    examples?: string;
  };
  progressAssessment?: string;
  progressNotes?: string;
  safetyDignityNotes?: string;
  nextSteps?: string;
  activities?: ActivityInput[];
}

export interface ActivityInput {
  activityNumber: number;
  taskGoal: string;
  supportsProvided?: string;
  promptLevel: string[];
  objectiveObservation?: string;
}

export interface IncidentReportInput {
  clientId: string;
  incidentDate: string;
  incidentTime: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  employeeStatement?: string;
  clientStatement?: string;
  actionTaken?: string;
  severity: string;
  incidentType: string;
}

export interface ApprovalAction {
  action: 'approve' | 'reject' | 'request_changes';
  comment?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: string;
  clientId?: string;
  staffId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
