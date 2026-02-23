/**
 * EduLead Pro CRM - API Service Layer
 * ====================================
 * Handles all HTTP requests to the Next.js API routes
 */

const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3000';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // Try to read JSON body; fall back to text/status
      const text = await response.text().catch(() => '');
      let detail = '';
      try {
        const parsed = text ? JSON.parse(text) : {};
        detail = parsed.detail || parsed.message || '';
      } catch {
        // ignore JSON parse failures
      }
      const statusText = response.statusText || 'Request failed';
      throw new Error(detail || `${statusText} (${response.status})`);
    }

    // If no body, return undefined
    if (response.status === 204) return undefined as T;
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================
// DASHBOARD API
// ============================================

export interface DashboardStats {
  leadsToday: number;
  leadsTotal: number;
  activeTasks: number;
  overdueTasks: number;
  conversionRate: number;
  aiResponseRate: number;
}

export interface SourceDistribution {
  name: string;
  value: number;
}

export interface PipelineFunnel {
  stage: string;
  count: number;
}

export interface StaffPerformance {
  name: string;
  calls: number;
  potentials: number;
}

export interface CountrySegmentation {
  name: string;
  leads: number;
}

export interface ReferralPayout {
  agent: string;
  leads: number;
  pending: string;
}

export const dashboardAPI = {
  getStats: () => fetchAPI<DashboardStats>('/api/dashboard/stats'),
  getSourceDistribution: () => fetchAPI<SourceDistribution[]>('/api/dashboard/source-distribution'),
  getPipelineFunnel: () => fetchAPI<PipelineFunnel[]>('/api/dashboard/pipeline-funnel'),
  getStaffPerformance: () => fetchAPI<StaffPerformance[]>('/api/dashboard/staff-performance'),
  getCountrySegmentation: () => fetchAPI<CountrySegmentation[]>('/api/dashboard/country-segmentation'),
  getReferralPayouts: () => fetchAPI<ReferralPayout[]>('/api/dashboard/referral-payouts'),
};

// ============================================
// LEAD MANAGEMENT API
// ============================================

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: string;
  interestLevel: string;
  assignedTo?: string;
  desiredCountry?: string;
  desiredCourse?: string;
  aiFlagged?: boolean;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface LeadFilters {
  limit?: number;
  stage?: string;
  source?: string;
  interest_level?: string;
  assigned_to?: string;
}

export const leadsAPI = {
  getLeads: (filters?: LeadFilters) => {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.stage) params.append('stage', filters.stage);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.interest_level) params.append('interest_level', filters.interest_level);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
    
    return fetchAPI<Lead[]>(`/api/leads?${params.toString()}`);
  },
  
  getLead: (leadId: string) => fetchAPI<Lead>(`/api/leads/${leadId}`),
  
  searchLeads: (searchTerm: string) => fetchAPI<Lead[]>(`/api/leads/search/${searchTerm}`),
};

// ============================================
// USER & AUTHENTICATION API
// ============================================

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: string;
  dataScope: string;
  teamId?: string;
  lastActive?: string;
  isOnline?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
}

export const usersAPI = {
  getUsers: (filters?: UserFilters) => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    
    return fetchAPI<User[]>(`/api/users?${params.toString()}`);
  },
  
  getUser: (userId: string) => fetchAPI<User>(`/api/users/${userId}`),
  
  login: (credentials: LoginCredentials) => 
    fetchAPI<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};

// ============================================
// TASK MANAGEMENT API
// ============================================

export interface Task {
  _id: string;
  leadId?: string;
  leadName?: string;
  leadPhone?: string;
  projectId?: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  assignedTo?: string;
  type: string;
  priority: string;
  slaDeadline?: string;
  source?: string;
  checklist?: { item: string; completed: boolean }[];
}

export interface TaskFilters {
  assigned_to?: string;
  status?: string;
  project_id?: string;
}

export const tasksAPI = {
  getTasks: (filters?: TaskFilters) => {
    const params = new URLSearchParams();
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.project_id) params.append('project_id', filters.project_id);
    
    return fetchAPI<Task[]>(`/api/tasks?${params.toString()}`);
  },
  
  getOverdueTasks: () => fetchAPI<Task[]>('/api/tasks/overdue'),
};

// ============================================
// WHATSAPP & AI API
// ============================================

export interface WhatsAppConversation {
  _id: string;
  leadId: string;
  phone: string;
  status: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

export interface ConversationFilters {
  status?: string;
  lead_id?: string;
}

export const whatsappAPI = {
  getConversations: (filters?: ConversationFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.lead_id) params.append('lead_id', filters.lead_id);
    
    return fetchAPI<WhatsAppConversation[]>(`/api/whatsapp/conversations?${params.toString()}`);
  },
};

// ============================================
// CAMPAIGN & MARKETING API
// ============================================

export interface Campaign {
  _id: string;
  name: string;
  platform: string;
  status: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate?: string;
}

export interface CampaignFilters {
  platform?: string;
  status?: string;
}

export const campaignsAPI = {
  getCampaigns: (filters?: CampaignFilters) => {
    const params = new URLSearchParams();
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.status) params.append('status', filters.status);
    
    return fetchAPI<Campaign[]>(`/api/campaigns?${params.toString()}`);
  },
};

// ============================================
// PROJECT & ASSIGNMENT API
// ============================================

export interface Project {
  _id: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
}

export const projectsAPI = {
  getProjects: () => fetchAPI<Project[]>('/api/projects'),
};

// ============================================
// AGENT & REFERRAL API
// ============================================

export interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  commissionRate: number;
  totalReferrals: number;
  totalEarnings: number;
}

export interface Payout {
  _id: string;
  agentId: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
}

export interface AgentFilters {
  status?: string;
}

export interface PayoutFilters {
  agent_id?: string;
  status?: string;
}

export const agentsAPI = {
  getAgents: (filters?: AgentFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    
    return fetchAPI<Agent[]>(`/api/agents?${params.toString()}`);
  },
  
  getPayouts: (filters?: PayoutFilters) => {
    const params = new URLSearchParams();
    if (filters?.agent_id) params.append('agent_id', filters.agent_id);
    if (filters?.status) params.append('status', filters.status);
    
    return fetchAPI<Payout[]>(`/api/payouts?${params.toString()}`);
  },
};

// ============================================
// ACTIVITY LOG API
// ============================================

export interface ActivityLog {
  _id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ActivityLogFilters {
  user_id?: string;
  limit?: number;
}

export const activityLogsAPI = {
  getLogs: (filters?: ActivityLogFilters) => {
    const params = new URLSearchParams();
    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    return fetchAPI<ActivityLog[]>(`/api/activity-logs?${params.toString()}`);
  },
};

// Export a default API object with all endpoints
const api = {
  dashboard: dashboardAPI,
  leads: leadsAPI,
  users: usersAPI,
  tasks: tasksAPI,
  whatsapp: whatsappAPI,
  campaigns: campaignsAPI,
  projects: projectsAPI,
  agents: agentsAPI,
  activityLogs: activityLogsAPI,
};

export default api;
