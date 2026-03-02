const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Public request method for custom API calls
  async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getClients(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/api/clients${params}`);
  }

  async getClient(id: string) {
    return this.request(`/api/clients/${id}`);
  }

  async createClient(data: any) {
    return this.request('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProgressNotes(filters?: any) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    
    const queryString = params.toString();
    return this.request(`/api/progress-notes${queryString ? `?${queryString}` : ''}`);
  }

  async getProgressNote(id: string) {
    return this.request(`/api/progress-notes/${id}`);
  }

  async approveProgressNote(id: string, action: 'approve' | 'reject' | 'request_changes', comment?: string) {
    return this.request(`/api/progress-notes/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, comment }),
    });
  }

  async getIncidents(filters?: any) {
    const params = new URLSearchParams();
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    return this.request(`/api/incidents${queryString ? `?${queryString}` : ''}`);
  }

  async getSessions(filters?: any) {
    const params = new URLSearchParams();
    if (filters?.staffId) params.append('staffId', filters.staffId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    
    const queryString = params.toString();
    return this.request(`/api/sessions/all${queryString ? `?${queryString}` : ''}`);
  }

  async getActiveSession() {
    try {
      return await this.request('/api/sessions/active');
    } catch (error) {
      return null;
    }
  }

  async clockIn(data: { clientId: string; serviceType: string; latitude: number; longitude: number; locationName?: string }) {
    return this.request('/api/sessions/clock-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async clockOut(sessionId?: string) {
    return this.request('/api/sessions/clock-out', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async getAssignedClients() {
    return this.request('/api/my-clients');
  }

  // Form Templates
  async getFormTemplates(formType?: string) {
    const params = formType ? `?formType=${encodeURIComponent(formType)}` : '';
    return this.request(`/api/form-templates${params}`);
  }

  async getFormTemplate(id: string) {
    return this.request(`/api/form-templates/${id}`);
  }

  async saveFormResponse(data: { templateId: string; responseData: any; status: string; progressNoteId?: string; incidentReportId?: string }) {
    return this.request('/api/form-responses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFormResponses(status?: string) {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request(`/api/form-responses${params}`);
  }

  async getFormResponse(id: string) {
    return this.request(`/api/form-responses/${id}`);
  }

  async updateFormResponse(id: string, data: { responseData: any; status: string }) {
    return this.request(`/api/form-responses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getSubmittedFormResponses(formType?: string) {
    const params = formType ? `?formType=${encodeURIComponent(formType)}` : '';
    return this.request(`/api/form-responses/submitted/all${params}`);
  }

  async approveFormResponse(id: string, action: 'approve' | 'reject', comment?: string) {
    return this.request(`/api/form-responses/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, comment }),
    });
  }

  async getFormStatistics() {
    return this.request('/api/form-responses/statistics');
  }

  // Tasks
  async getTasks(filters?: { status?: string; priority?: string; taskType?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.taskType) params.append('taskType', filters.taskType);
    
    const queryString = params.toString();
    return this.request(`/api/tasks/my-tasks${queryString ? `?${queryString}` : ''}`);
  }

  async getAssignedTasks(filters?: { status?: string; assignedTo?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    
    const queryString = params.toString();
    return this.request(`/api/tasks/assigned${queryString ? `?${queryString}` : ''}`);
  }

  async getTask(id: string) {
    return this.request(`/api/tasks/${id}`);
  }

  async createTask(data: any) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: any) {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async startTask(id: string) {
    return this.request(`/api/tasks/${id}/start`, {
      method: 'POST',
    });
  }

  async completeTask(id: string, data: { completionNotes?: string; actualHours?: number }) {
    return this.request(`/api/tasks/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleChecklistItem(itemId: string, isCompleted: boolean) {
    return this.request(`/api/tasks/checklist/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ isCompleted }),
    });
  }

  async getTaskStatistics() {
    return this.request('/api/tasks/statistics');
  }

  // Violations
  async getViolations(filters?: { userId?: string; status?: string; severity?: string }) {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    
    const queryString = params.toString();
    return this.request(`/api/violations${queryString ? `?${queryString}` : ''}`);
  }

  async getMyViolations(status?: string) {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request(`/api/violations/my-violations${params}`);
  }

  async getViolation(id: string) {
    return this.request(`/api/violations/${id}`);
  }

  async createViolation(data: any) {
    return this.request('/api/violations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resolveViolation(id: string, resolution: string) {
    return this.request(`/api/violations/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    });
  }

  async appealViolation(id: string, appealNotes: string) {
    return this.request(`/api/violations/${id}/appeal`, {
      method: 'POST',
      body: JSON.stringify({ appealNotes }),
    });
  }

  async getViolationStatistics() {
    return this.request('/api/violations/statistics');
  }

  async getUserViolationSummary(userId: string) {
    return this.request(`/api/violations/user/${userId}/summary`);
  }

  // Service Strategies
  async getServiceStrategies(category?: string) {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request(`/api/service-strategies${params}`);
  }

  async getServiceStrategiesByCategory() {
    return this.request('/api/service-strategies/by-category');
  }

  async getServiceStrategy(id: string) {
    return this.request(`/api/service-strategies/${id}`);
  }

  async createServiceStrategy(data: { category: string; name: string; description?: string }) {
    return this.request('/api/service-strategies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateServiceStrategy(id: string, data: any) {
    return this.request(`/api/service-strategies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteServiceStrategy(id: string) {
    return this.request(`/api/service-strategies/${id}`, {
      method: 'DELETE',
    });
  }

  // Schedules
  async getCalendarSchedules(startDate: string, endDate: string) {
    return this.request(`/api/schedules/calendar?startDate=${startDate}&endDate=${endDate}`);
  }

  async getUserSchedules(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    return this.request(`/api/schedules/my-schedules${queryString ? `?${queryString}` : ''}`);
  }

  async getOrganizationSchedules(filters?: { userId?: string; startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    return this.request(`/api/schedules/organization${queryString ? `?${queryString}` : ''}`);
  }

  async createSchedule(data: any) {
    return this.request('/api/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSchedule(id: string, data: any) {
    return this.request(`/api/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSchedule(id: string) {
    return this.request(`/api/schedules/${id}`, {
      method: 'DELETE',
    });
  }

  // ISP Goals
  async getIspGoals(clientId?: string, status?: string) {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    return this.request(`/api/isp-goals/goals${queryString ? `?${queryString}` : ''}`);
  }

  async createIspGoal(data: any) {
    return this.request('/api/isp-goals/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIspGoal(id: string, data: any) {
    return this.request(`/api/isp-goals/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIspGoal(id: string) {
    return this.request(`/api/isp-goals/goals/${id}`, {
      method: 'DELETE',
    });
  }
  
  async getGoalActivities(goalId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/api/isp-goals/goals/${goalId}/activities${params}`);
  }
  
  async addGoalActivity(goalId: string, data: any) {
    return this.request(`/api/isp-goals/goals/${goalId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async updateMilestone(milestoneId: string, data: any) {
    return this.request(`/api/isp-goals/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ISP Activities
  async getIspActivities(goalId?: string) {
    const params = goalId ? `?goalId=${goalId}` : '';
    return this.request(`/api/isp-activities${params}`);
  }

  async createIspActivity(data: any) {
    return this.request('/api/isp-activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIspActivity(id: string, data: any) {
    return this.request(`/api/isp-activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIspActivity(id: string) {
    return this.request(`/api/isp-activities/${id}`, {
      method: 'DELETE',
    });
  }

  // Users Management (Admin/Manager)
  async getOrganizationUsers(role?: string) {
    const params = role ? `?role=${role}` : '';
    return this.request(`/api/admin/users${params}`);
  }

  async updateUser(id: string, data: any) {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createUser(data: any) {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getNotifications(filters?: { isRead?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.isRead !== undefined) params.append('isRead', String(filters.isRead));
    
    const queryString = params.toString();
    return this.request(`/api/notifications${queryString ? `?${queryString}` : ''}`);
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/api/notifications/read-all', {
      method: 'POST',
    });
  }

  // Support Tickets
  async getSupportTickets(filters?: { status?: string; priority?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    
    const queryString = params.toString();
    return this.request(`/api/support/tickets${queryString ? `?${queryString}` : ''}`);
  }

  async getSupportTicket(id: string) {
    return this.request(`/api/support/tickets/${id}`);
  }

  async createSupportTicket(data: any) {
    return this.request('/api/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSupportTicketStatus(id: string, status: string, comment?: string) {
    return this.request(`/api/support/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comment }),
    });
  }

  // Tenants (Super Admin)
  async getTenants() {
    return this.request('/api/admin/tenants');
  }

  async getTenant(id: string) {
    return this.request(`/api/admin/tenants/${id}`);
  }

  async createTenant(data: any) {
    return this.request('/api/admin/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTenant(id: string, data: any) {
    return this.request(`/api/admin/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getTenantMetrics(id: string) {
    return this.request(`/api/admin/tenants/${id}/metrics`);
  }

  // Usage Metrics (Super Admin)
  async getUsageMetrics() {
    return this.request('/api/admin/usage-metrics');
  }

  async getOrganizationMetrics(organizationId: string) {
    return this.request(`/api/admin/usage-metrics/${organizationId}`);
  }

  // System Overview (Super Admin)
  async getSystemOverview() {
    return this.request('/api/admin/overview');
  }

  // Audit Logs
  async getAuditLogs(filters?: { userId?: string; action?: string; startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    return this.request(`/api/admin/audit-logs${queryString ? `?${queryString}` : ''}`);
  }

  // System Statistics (Super Admin)
  async getSystemStats() {
    return this.request('/api/admin/stats');
  }

  // Organizations (alias for tenants)
  async getOrganizations(filters?: { isActive?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    
    const queryString = params.toString();
    return this.request(`/api/admin/organizations${queryString ? `?${queryString}` : ''}`);
  }

  async getOrganization(id: string) {
    return this.request(`/api/admin/organizations/${id}`);
  }

  // Support Ticket Statistics
  async getSupportTicketStats() {
    return this.request('/api/support/tickets/stats');
  }

  // DSP-Manager Assignments (Admin)
  async getDspManagerAssignments() {
    return this.request('/api/admin/dsp-manager-assignments');
  }

  async createDspManagerAssignment(data: { dspId: string; managerId: string; notes?: string }) {
    return this.request('/api/admin/dsp-manager-assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeDspManagerAssignment(id: string) {
    return this.request(`/api/admin/dsp-manager-assignments/${id}`, {
      method: 'DELETE',
    });
  }

  // Manager: Get assigned DSPs
  async getMyAssignedDsps() {
    return this.request('/api/admin/manager/my-dsps');
  }

  // Client Assignments (Admin/Manager)
  async getClientAssignments() {
    return this.request('/api/assignments');
  }

  async createClientAssignment(data: { clientId: string; dspId: string; notes?: string; startDate?: string }) {
    return this.request('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeClientAssignment(id: string) {
    return this.request(`/api/assignments/${id}`, {
      method: 'DELETE',
    });
  }

  async getDspClients(dspId?: string) {
    const endpoint = dspId ? `/api/dsp/${dspId}/clients` : '/api/my-clients';
    return this.request(endpoint);
  }
}

export const api = new ApiClient();
