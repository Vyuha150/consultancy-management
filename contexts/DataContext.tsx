/**
 * Data Context
 * ============
 * Manages application-wide data fetching and caching
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api, { 
  DashboardStats, 
  SourceDistribution, 
  PipelineFunnel, 
  StaffPerformance,
  CountrySegmentation,
  ReferralPayout,
  Lead,
  User,
  Task,
  Project,
  Campaign
} from '../services/api';

interface DataContextType {
  // Dashboard Data
  dashboardStats: DashboardStats | null;
  sourceDistribution: SourceDistribution[];
  pipelineFunnel: PipelineFunnel[];
  staffPerformance: StaffPerformance[];
  countrySegmentation: CountrySegmentation[];
  referralPayouts: ReferralPayout[];
  
  // Entity Data
  leads: Lead[];
  users: User[];
  tasks: Task[];
  projects: Project[];
  campaigns: Campaign[];
  
  // Loading States
  loading: {
    dashboard: boolean;
    leads: boolean;
    users: boolean;
    tasks: boolean;
  };
  
  // Error States
  errors: {
    dashboard?: string;
    leads?: string;
    users?: string;
    tasks?: string;
  };
  
  // Refresh Functions
  refreshDashboard: () => Promise<void>;
  refreshLeads: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Dashboard State
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [sourceDistribution, setSourceDistribution] = useState<SourceDistribution[]>([]);
  const [pipelineFunnel, setPipelineFunnel] = useState<PipelineFunnel[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [countrySegmentation, setCountrySegmentation] = useState<CountrySegmentation[]>([]);
  const [referralPayouts, setReferralPayouts] = useState<ReferralPayout[]>([]);
  
  // Entity State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  // Loading State
  const [loading, setLoading] = useState({
    dashboard: false,
    leads: false,
    users: false,
    tasks: false,
  });
  
  // Error State
  const [errors, setErrors] = useState<{
    dashboard?: string;
    leads?: string;
    users?: string;
    tasks?: string;
  }>({});

  // Refresh Dashboard Data
  const refreshDashboard = useCallback(async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    setErrors(prev => ({ ...prev, dashboard: undefined }));
    
    try {
      const [stats, sources, pipeline, performance, countries, payouts] = await Promise.all([
        api.dashboard.getStats(),
        api.dashboard.getSourceDistribution(),
        api.dashboard.getPipelineFunnel(),
        api.dashboard.getStaffPerformance(),
        api.dashboard.getCountrySegmentation(),
        api.dashboard.getReferralPayouts(),
      ]);
      
      setDashboardStats(stats);
      setSourceDistribution(sources);
      setPipelineFunnel(pipeline);
      setStaffPerformance(performance);
      setCountrySegmentation(countries);
      setReferralPayouts(payouts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      setErrors(prev => ({ ...prev, dashboard: errorMessage }));
      console.error('Dashboard refresh error:', error);
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  }, []);

  // Refresh Leads Data
  const refreshLeads = useCallback(async () => {
    setLoading(prev => ({ ...prev, leads: true }));
    setErrors(prev => ({ ...prev, leads: undefined }));
    
    try {
      const leadsData = await api.leads.getLeads({ limit: 100 });
      setLeads(leadsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leads';
      setErrors(prev => ({ ...prev, leads: errorMessage }));
      console.error('Leads refresh error:', error);
    } finally {
      setLoading(prev => ({ ...prev, leads: false }));
    }
  }, []);

  // Refresh Users Data
  const refreshUsers = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    setErrors(prev => ({ ...prev, users: undefined }));
    
    try {
      const usersData = await api.users.getUsers({ status: 'ACTIVE' });
      setUsers(usersData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      setErrors(prev => ({ ...prev, users: errorMessage }));
      console.error('Users refresh error:', error);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);

  // Refresh Tasks Data
  const refreshTasks = useCallback(async () => {
    setLoading(prev => ({ ...prev, tasks: true }));
    setErrors(prev => ({ ...prev, tasks: undefined }));
    
    try {
      const tasksData = await api.tasks.getTasks();
      setTasks(tasksData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      setErrors(prev => ({ ...prev, tasks: errorMessage }));
      console.error('Tasks refresh error:', error);
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  }, []);

  // Refresh All Data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshDashboard(),
      refreshLeads(),
      refreshUsers(),
      refreshTasks(),
    ]);
  }, [refreshDashboard, refreshLeads, refreshUsers, refreshTasks]);

  // Initial data fetch on mount
  useEffect(() => {
    refreshDashboard();
    refreshLeads();
    refreshUsers();
    refreshTasks();
    
    // Fetch projects and campaigns
    api.projects.getProjects().then(setProjects).catch(console.error);
    api.campaigns.getCampaigns().then(setCampaigns).catch(console.error);
  }, [refreshDashboard, refreshLeads, refreshUsers, refreshTasks]);

  const value: DataContextType = {
    dashboardStats,
    sourceDistribution,
    pipelineFunnel,
    staffPerformance,
    countrySegmentation,
    referralPayouts,
    leads,
    users,
    tasks,
    projects,
    campaigns,
    loading,
    errors,
    refreshDashboard,
    refreshLeads,
    refreshUsers,
    refreshTasks,
    refreshAll,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
