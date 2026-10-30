import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response: any) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic hook for API calls
export function useApi<T>(endpoint: string, options?: { enabled?: boolean }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoint);
      setData(response.data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [endpoint, options?.enabled]);

  return { data, loading, error, refetch: fetchData };
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    return user;
  },
  register: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = await api.post('/auth/register', data);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    return user;
  },
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
};

// Sites API
export const sitesApi = {
  getAll: async () => {
    const response = await api.get('/sites');
    return response.data.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/sites/${id}`);
    return response.data.data;
  },
  create: async (data: any) => {
    const response = await api.post('/sites', data);
    return response.data.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/sites/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number) => {
    await api.delete(`/sites/${id}`);
  },
  getStats: async (id: number) => {
    const response = await api.get(`/sites/${id}/stats`);
    return response.data.data;
  },
};

// Cameras API
export const camerasApi = {
  getAll: async (params?: { siteId?: number; status?: string; type?: string }) => {
    const response = await api.get('/cameras', { params });
    return response.data.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/cameras/${id}`);
    return response.data.data;
  },
  create: async (data: any) => {
    const response = await api.post('/cameras', data);
    return response.data.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/cameras/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number) => {
    await api.delete(`/cameras/${id}`);
  },
  test: async (id: number) => {
    const response = await api.post(`/cameras/${id}/test`);
    return response.data.data;
  },
  getBySite: async (siteId: number) => {
    const response = await api.get(`/cameras/site/${siteId}`);
    return response.data.data;
  },
};

// Agents API
export const agentsApi = {
  getAll: async (params?: { siteId?: number; status?: string }) => {
    const response = await api.get('/agents', { params });
    return response.data.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/agents/${id}`);
    return response.data.data;
  },
  create: async (data: any) => {
    const response = await api.post('/agents', data);
    return response.data.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/agents/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number) => {
    await api.delete(`/agents/${id}`);
  },
  updateStatus: async (id: number, status: string, serviceStartTime?: string) => {
    const response = await api.patch(`/agents/${id}/status`, { status, serviceStartTime });
    return response.data.data;
  },
  getBySite: async (siteId: number) => {
    const response = await api.get(`/agents/site/${siteId}`);
    return response.data.data;
  },
};

// Events API
export const eventsApi = {
  getAll: async (params?: { siteId?: number; status?: string; severity?: string }) => {
    const response = await api.get('/events', { params });
    return response.data.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  },
  create: async (data: any) => {
    const response = await api.post('/events', data);
    return response.data.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data.data;
  },
  delete: async (id: number) => {
    await api.delete(`/events/${id}`);
  },
  getBySite: async (siteId: number) => {
    const response = await api.get(`/events/site/${siteId}`);
    return response.data.data;
  },
};

// Alarms API
export const alarmsApi = {
  getAll: async (params?: { siteId?: number; status?: string; priority?: string }) => {
    const response = await api.get('/alarms', { params });
    return response.data.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/alarms/${id}`);
    return response.data.data;
  },
  create: async (data: any) => {
    const response = await api.post('/alarms', data);
    return response.data.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/alarms/${id}`, data);
    return response.data.data;
  },
  getActive: async () => {
    const response = await api.get('/alarms/active/all');
    return response.data.data;
  },
  getBySite: async (siteId: number) => {
    const response = await api.get(`/alarms/site/${siteId}`);
    return response.data.data;
  },
};

// Rounds API
export const roundsApi = {
  getAll: async (params?: { siteId?: number; status?: string; type?: string }) => {
    const response = await api.get('/rounds', { params });
    return response.data.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/rounds/${id}`);
    return response.data.data;
  },
  create: async (data: any) => {
    const response = await api.post('/rounds', data);
    return response.data.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/rounds/${id}`, data);
    return response.data.data;
  },
  getBySite: async (siteId: number) => {
    const response = await api.get(`/rounds/site/${siteId}`);
    return response.data.data;
  },
  getByAgent: async (agentId: number) => {
    const response = await api.get(`/rounds/agent/${agentId}`);
    return response.data.data;
  },
};

// CRM API
export const crmApi = {
  getContacts: async (siteId?: number) => {
    const response = await api.get('/crm/contacts', { params: { siteId } });
    return response.data.data;
  },
  createContact: async (data: any) => {
    const response = await api.post('/crm/contacts', data);
    return response.data.data;
  },
  getInstallations: async (siteId?: number) => {
    const response = await api.get('/crm/installations', { params: { siteId } });
    return response.data.data;
  },
  createInstallation: async (data: any) => {
    const response = await api.post('/crm/installations', data);
    return response.data.data;
  },
  getInterventions: async (siteId?: number, status?: string) => {
    const response = await api.get('/crm/interventions', { params: { siteId, status } });
    return response.data.data;
  },
  createIntervention: async (data: any) => {
    const response = await api.post('/crm/interventions', data);
    return response.data.data;
  },
  getContracts: async (siteId?: number, status?: string) => {
    const response = await api.get('/crm/contracts', { params: { siteId, status } });
    return response.data.data;
  },
  createContract: async (data: any) => {
    const response = await api.post('/crm/contracts', data);
    return response.data.data;
  },
  getStats: async () => {
    const response = await api.get('/crm/stats');
    return response.data.data;
  },
};

// Billing API
export const billingApi = {
  getInvoices: async (status?: string, type?: string) => {
    const response = await api.get('/billing/invoices', { params: { status, type } });
    return response.data.data;
  },
  getInvoiceById: async (id: number) => {
    const response = await api.get(`/billing/invoices/${id}`);
    return response.data.data;
  },
  createInvoice: async (data: any) => {
    const response = await api.post('/billing/invoices', data);
    return response.data.data;
  },
  updateInvoice: async (id: number, data: any) => {
    const response = await api.put(`/billing/invoices/${id}`, data);
    return response.data.data;
  },
  createCheckoutSession: async (plan: string) => {
    const response = await api.post('/billing/create-checkout-session', { plan });
    return response.data.data;
  },
  getSubscription: async () => {
    const response = await api.get('/billing/subscription');
    return response.data.data;
  },
  getStats: async () => {
    const response = await api.get('/billing/stats');
    return response.data.data;
  },
};

// Support API
export const supportApi = {
  getTickets: async (status?: string, priority?: string) => {
    const response = await api.get('/support/tickets', { params: { status, priority } });
    return response.data.data;
  },
  getTicketById: async (id: number) => {
    const response = await api.get(`/support/tickets/${id}`);
    return response.data.data;
  },
  createTicket: async (data: any) => {
    const response = await api.post('/support/tickets', data);
    return response.data.data;
  },
  addMessage: async (ticketId: number, message: string) => {
    const response = await api.post(`/support/tickets/${ticketId}/messages`, { message });
    return response.data.data;
  },
  updateStatus: async (ticketId: number, status: string, assignedTo?: number, satisfaction?: number) => {
    const response = await api.patch(`/support/tickets/${ticketId}/status`, { status, assignedTo, satisfaction });
    return response.data.data;
  },
  rateTicket: async (ticketId: number, satisfaction: number) => {
    const response = await api.post(`/support/tickets/${ticketId}/rate`, { satisfaction });
    return response.data.data;
  },
  getStats: async () => {
    const response = await api.get('/support/stats');
    return response.data.data;
  },
};

// ShopGuard API
export const shopguardApi = {
  getStatus: async () => {
    const response = await api.get('/shopguard/status');
    return response.data.data;
  },
  getCameraResults: async (cameraId: string) => {
    const response = await api.get(`/shopguard/cameras/${cameraId}/results`);
    return response.data.data;
  },
  getAlerts: async () => {
    const response = await api.get('/shopguard/alerts');
    return response.data.data;
  },
  updateConfig: async (config: any) => {
    const response = await api.post('/shopguard/config', config);
    return response.data.data;
  },
  controlEngine: async (action: 'start' | 'stop') => {
    const response = await api.post(`/shopguard/engine/${action}`);
    return response.data.data;
  },
  getMetrics: async () => {
    const response = await api.get('/shopguard/metrics');
    return response.data.data;
  },
};

export default api;
