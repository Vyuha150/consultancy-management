
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Search, Filter, Calendar, CheckCircle2, Clock, AlertCircle, 
  ArrowUpRight, ArrowDownRight, MoreVertical, Plus, ChevronRight, 
  ChevronDown, MessageSquare, Phone, Globe, Zap, ShieldCheck, 
  Settings, Trash2, Smartphone, Save, History, Eye, X, 
  ClipboardList, UserPlus, Briefcase, TrendingUp, Lock, ZapOff,
  Activity, Award, BarChart3, LineChart as LineChartIcon,
  CheckCircle, ListTodo, UserCheck, Smartphone as PhoneIcon, Bot, MapPin,
  LayoutGrid, List, Sliders, ShieldAlert, Target, Sparkles,
  ArrowRightCircle, Check, Repeat, Mail, Bell, 
  ArrowRight, FileText, CalendarClock, LayoutDashboard, Download,
  CheckSquare, BookOpen, Fingerprint, GraduationCap, Unlock,
  ArrowUpDown, Timer, Layers, Loader
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { User, EmployeeStats, UserRole, Project, LeadSource, Task } from '../types';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

const EmployeeProductivity: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'queue' | 'assign' | 'insights'>('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('This Week');
  const [allocationVolume, setAllocationVolume] = useState(5);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string | 'name'; direction: 'asc' | 'desc' } | null>(null);
  const [taskActionLoading, setTaskActionLoading] = useState<string | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState<{ taskId: string; dueDate: string } | null>(null);
  const [noteModal, setNoteModal] = useState<{ taskId: string; note: string } | null>(null);
  const [rebalanceModal, setRebalanceModal] = useState<{ userId: string; allocations: number } | null>(null);
  const [lockModal, setLockModal] = useState<{ userId: string; locked: boolean } | null>(null);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.TELECALLER,
    teamId: ''
  });
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchTasks();
    fetchProjects();
    fetchLeads();
  }, []);

  const handleCreateAccount = async () => {
    setAccountError('');
    setAccountSuccess('');

    if (!newAccount.name || !newAccount.email || !newAccount.password) {
      setAccountError('Please fill in all required fields');
      return;
    }

    if (newAccount.password !== newAccount.confirmPassword) {
      setAccountError('Passwords do not match');
      return;
    }

    if (newAccount.password.length < 6) {
      setAccountError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAccount.name,
          email: newAccount.email,
          password: newAccount.password,
          role: newAccount.role,
          teamId: newAccount.teamId || undefined,
          dataScope: 'ONLY_ASSIGNED',
          status: 'ACTIVE'
        })
      });

      if (response.ok) {
        setAccountSuccess('Account created successfully!');
        setTimeout(() => {
          setShowCreateAccountModal(false);
          setNewAccount({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: UserRole.TELECALLER,
            teamId: ''
          });
          fetchEmployees(); // Refresh the list
        }, 2000);
      } else {
        const error = await response.json();
        setAccountError(error.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Account creation error:', error);
      setAccountError('An error occurred while creating the account');
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
  };

  const normalizeStats = (stats?: any) => ({
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    totalTasks: 0,
    completionRate: 0,
    capacity: 0,
    maxCapacity: 10,
    leadsGenerated: 0,
    slaHistory: [],
    sourceSplit: [],
    ...stats
  });

  const enrichedEmployees = useMemo(() => {
    return employees.map((u: any) => {
      const userId = u.id || u._id;
      const userTasks = tasks.filter((t: any) => t.assignedTo === userId);
      const completedCount = userTasks.filter((t: any) => t.status === 'COMPLETED').length;
      const pendingCount = userTasks.filter((t: any) => t.status === 'ASSIGNED').length;
      const inProgressCount = userTasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
      const overdueCount = userTasks.filter((t: any) => t.status === 'OVERDUE').length;
      const completionRate = userTasks.length > 0 ? Math.round((completedCount / userTasks.length) * 100) : 0;

      return {
        ...u,
        stats: normalizeStats({
          ...u.stats,
          completedTasks: completedCount,
          pendingTasks: pendingCount,
          inProgressTasks: inProgressCount,
          overdueTasks: overdueCount,
          totalTasks: userTasks.length,
          completionRate
        })
      };
    });
  }, [employees, tasks]);

  const selectedEmployee = useMemo(() => enrichedEmployees.find(u => (u.id || u._id) === selectedUserId), [selectedUserId, enrichedEmployees]);
  const selectedStats = useMemo(() => selectedEmployee?.stats, [selectedEmployee]);

  const sortedAndFilteredEmployees = useMemo(() => {
    let result = enrichedEmployees.filter(u => {
      const name = (u.name ?? '').toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase());
      const matchesTeam = selectedTeam === 'all' || u.role === selectedTeam;
      
      const stats = u.stats;
      if (!stats) return matchesSearch && matchesTeam;

      if (activeKpiFilter === 'overdue' && stats.overdueTasks === 0) return false;
      if (activeKpiFilter === 'high_sla' && stats.completionRate < 95) return false;
      if (activeKpiFilter === 'conversions' && stats.completedTasks < 15) return false;

      return matchesSearch && matchesTeam;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = sortConfig.key === 'name' ? a.name : (a.stats?.[sortConfig.key as keyof typeof a.stats] ?? 0);
        const bVal = sortConfig.key === 'name' ? b.name : (b.stats?.[sortConfig.key as keyof typeof b.stats] ?? 0);
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchTerm, selectedTeam, activeKpiFilter, sortConfig, enrichedEmployees]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const overdueTasks = tasks.filter(t => t.status === 'OVERDUE').length;
  const totalEmployees = enrichedEmployees.length;

  const leadSourceCounts = useMemo(() => {
    return leads.reduce((acc: Record<string, number>, lead: any) => {
      const source = lead.source || 'UNKNOWN';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
  }, [leads]);

  const getCapacityColor = (cap: number) => {
    if (cap > 8) return 'bg-rose-500';
    if (cap > 6) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getSourceColor = (source: LeadSource) => {
    switch (source) {
      case LeadSource.TELECALLER_SHEET: return 'bg-indigo-400';
      case LeadSource.WHATSAPP_AI: return 'bg-emerald-400';
      case LeadSource.SOCIAL_MEDIA: return 'bg-pink-400';
      case LeadSource.FIELD_MARKETING: return 'bg-amber-400';
      case LeadSource.REFERRAL: return 'bg-sky-400';
    }
  };

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleSort = (key: keyof EmployeeStats | 'name') => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getActiveProjectCount = (userId: string) => {
    return tasks.filter(t => t.assignedTo === userId).reduce((acc, curr) => {
      if (curr.projectId && !acc.includes(curr.projectId)) acc.push(curr.projectId);
      return acc;
    }, [] as string[]).length;
  };

  // Task Action Handlers
  const handleCompleteTask = async (taskId: string) => {
    setTaskActionLoading(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      if (response.ok) {
        alert('Task completed successfully!');
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      alert('Error completing task');
    } finally {
      setTaskActionLoading(null);
    }
  };

  const handleRescheduleTask = async () => {
    if (!rescheduleModal?.taskId || !rescheduleModal?.dueDate) return;
    setTaskActionLoading(rescheduleModal.taskId);
    try {
      const response = await fetch(`/api/tasks/${rescheduleModal.taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: rescheduleModal.dueDate })
      });
      if (response.ok) {
        alert('Task rescheduled successfully!');
        fetchTasks();
        setRescheduleModal(null);
      }
    } catch (error) {
      console.error('Failed to reschedule task:', error);
      alert('Error rescheduling task');
    } finally {
      setTaskActionLoading(null);
    }
  };

  const handleReassignTask = async (taskId: string) => {
    setTaskActionLoading(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ASSIGNED', assignedTo: null })
      });
      if (response.ok) {
        alert('Task marked for reassignment!');
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to reassign task:', error);
      alert('Error reassigning task');
    } finally {
      setTaskActionLoading(null);
    }
  };

  const handleAddNote = async () => {
    if (!noteModal?.taskId || !noteModal?.note) return;
    setTaskActionLoading(noteModal.taskId);
    try {
      const task = tasks.find(t => t._id === noteModal.taskId || t.id === noteModal.taskId);
      const notes = [...(task?.notes || []), { text: noteModal.note, createdAt: new Date() }];
      const response = await fetch(`/api/tasks/${noteModal.taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      if (response.ok) {
        alert('Note added successfully!');
        fetchTasks();
        setNoteModal(null);
      }
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Error adding note');
    } finally {
      setTaskActionLoading(null);
    }
  };

  const handleRebalanceLoad = async () => {
    if (!rebalanceModal?.userId) return;
    setTaskActionLoading(rebalanceModal.userId);
    try {
      const response = await fetch(`/api/employees/${rebalanceModal.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxCapacity: rebalanceModal.allocations })
      });
      if (response.ok) {
        alert('Load rebalanced successfully!');
        fetchEmployees();
        setRebalanceModal(null);
      }
    } catch (error) {
      console.error('Failed to rebalance load:', error);
      alert('Error rebalancing load');
    } finally {
      setTaskActionLoading(null);
    }
  };

  const handleLockAccess = async () => {
    if (!lockModal?.userId) return;
    setTaskActionLoading(lockModal.userId);
    try {
      const response = await fetch(`/api/employees/${lockModal.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: lockModal.locked })
      });
      if (response.ok) {
        alert(`Access ${lockModal.locked ? 'locked' : 'unlocked'} successfully!`);
        fetchEmployees();
        setLockModal(null);
      }
    } catch (error) {
      console.error('Failed to update lock status:', error);
      alert('Error updating access');
    } finally {
      setTaskActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full gap-8 animate-in fade-in duration-500 pb-20">
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader size={48} className="text-indigo-600 animate-spin" />
        </div>
      )}
      {!loading && (
      <>
      {/* 1. TOP HEADER & KPI CARDS */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <Users className="text-indigo-600" size={32} />
               Performance & Productivity
            </h1>
            <p className="text-slate-500 font-medium">Real-time workforce intelligence and capacity management.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
               <Briefcase size={16} className="text-slate-400" />
               <select 
                 value={selectedTeam}
                 onChange={e => setSelectedTeam(e.target.value)}
                 className="text-[10px] font-black uppercase tracking-widest bg-transparent border-none focus:ring-0 cursor-pointer text-slate-600"
               >
                 <option value="all">All Teams</option>
                 {Object.values(UserRole).map(role => (
                   <option key={role} value={role}>{role.replace('_', ' ')}</option>
                 ))}
               </select>
             </div>
             <div className="relative group min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search staff..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all shadow-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
               onClick={() => setShowCreateAccountModal(true)}
               className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
             >
               <UserPlus size={16} /> Add User
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { id: 'employees', label: 'Active Staff', value: totalEmployees, icon: Users, color: 'indigo' },
            { id: 'tasks', label: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'emerald' },
            { id: 'in_progress', label: 'In Progress', value: inProgressTasks, icon: Clock, color: 'amber' },
            { id: 'completed', label: 'Completed', value: completedTasks, icon: CheckCircle2, color: 'sky' },
            { id: 'overdue', label: 'Overdue', value: overdueTasks, icon: AlertCircle, color: 'rose' },
          ].map((kpi) => (
            <div 
              key={kpi.id} 
              onClick={() => setActiveKpiFilter(activeKpiFilter === kpi.id ? null : kpi.id)}
              className={`bg-white p-6 rounded-[32px] border-2 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden ${activeKpiFilter === kpi.id ? 'border-indigo-600 shadow-xl ring-4 ring-indigo-50' : 'border-transparent shadow-sm hover:border-indigo-200'}`}
            >
               <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                     <kpi.icon size={20} />
                  </div>
                  <ArrowUpRight size={14} className="text-slate-200 group-hover:text-indigo-400" />
               </div>
               <div>
                  <div className="text-2xl font-black text-slate-900 tabular-nums">{kpi.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{kpi.label}</div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. EMPLOYEE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {sortedAndFilteredEmployees.map(user => {
          const userId = user.id || user._id;
          const stats = normalizeStats(user.stats);
          const completionRate = stats.completedTasks + stats.pendingTasks > 0 ? Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks)) * 100) : 0;

          return (
            <div 
              key={userId}
              className={`bg-white rounded-[48px] border-2 transition-all group flex flex-col overflow-hidden relative shadow-sm hover:shadow-2xl ${selectedUserId === userId ? 'border-indigo-600 scale-[1.01]' : 'border-transparent hover:border-indigo-100'}`}
            >
               <div className="p-8 pb-4 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={user.avatar || 'https://picsum.photos/seed/user/100'} className="w-16 h-16 rounded-[24px] object-cover shadow-xl border-4 border-white" />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{user.name || 'Unnamed'}</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.role || 'UNASSIGNED'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Load</div>
                     <div className="text-lg font-black text-slate-900 mt-0.5">{stats.capacity}/10</div>
                     <div className="w-16 h-1.5 bg-slate-50 rounded-full mt-1.5 overflow-hidden ml-auto">
                        <div className={`h-full rounded-full transition-all duration-1000 ${getCapacityColor(stats.capacity)}`} style={{ width: `${(stats.capacity/stats.maxCapacity)*100}%` }}></div>
                     </div>
                  </div>
               </div>

               <div className="px-8 py-4 grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/50 p-4 rounded-3xl space-y-1 border border-transparent hover:border-indigo-100 transition-colors">
                     <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-900 tabular-nums">{stats.completedTasks}</span>
                        <CheckCircle2 size={16} className="text-emerald-500" />
                     </div>
                     <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed</div>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-3xl space-y-1 border border-transparent hover:border-indigo-100 transition-colors">
                     <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-900 tabular-nums">{stats.leadsGenerated}</span>
                        <Zap size={16} className="text-indigo-500" />
                     </div>
                     <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Leads Gen</div>
                  </div>
               </div>

               <div className="px-8 py-4 space-y-6">
                  <div className="flex items-center justify-between gap-6">
                     <div className="flex-1 space-y-2.5">
                        <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           <span>Progress Ring</span>
                           <span className="text-indigo-600">{completionRate}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                           <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                        </div>
                     </div>
                     <div className="w-20 h-10 flex flex-col items-center">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={stats.slaHistory}>
                              <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} dot={false} />
                           </AreaChart>
                        </ResponsiveContainer>
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter mt-1">SLA Trend</span>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Source Split</div>
                     <div className="flex h-2 rounded-full overflow-hidden shadow-sm bg-slate-50">
                        {stats.sourceSplit.map((s, idx) => (
                           <div 
                              key={idx} 
                              className={`h-full ${getSourceColor(s.source)} transition-all duration-700`} 
                            style={{ width: `${stats.leadsGenerated > 0 ? (s.count / stats.leadsGenerated) * 100 : 0}%` }}
                              title={`${s.source}: ${s.count}`}
                           />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {/* 3. POWER ADMIN TABLE VIEW */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Detailed Productivity Ledger</h3>
            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
               {sortedAndFilteredEmployees.length} Staff Profiles Active
            </div>
          </div>
          <button className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">
            <Download className="w-4 h-4" /> Export Performance Matrix
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th 
                  onClick={() => handleSort('name')}
                  className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-2">Employee <ArrowUpDown size={12} /></div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th 
                  onClick={() => handleSort('completedTasks')}
                  className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">Completed <ArrowUpDown size={12} /></div>
                </th>
                <th 
                  onClick={() => handleSort('leadsGenerated')}
                  className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">Leads <ArrowUpDown size={12} /></div>
                </th>
                <th 
                  onClick={() => handleSort('overdueTasks')}
                  className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2 text-rose-500">Overdue <ArrowUpDown size={12} /></div>
                </th>
                <th 
                  onClick={() => handleSort('slaPercentage')}
                  className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  <div className="flex items-center gap-2">SLA % <ArrowUpDown size={12} /></div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Resp</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Projects</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Workload</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAndFilteredEmployees.map(user => {
                const userId = user.id || user._id;
                const stats = normalizeStats(user.stats);
                const activeProjectCount = getActiveProjectCount(userId);
                return (
                  <tr key={userId} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-6" onClick={() => { setSelectedUserId(userId); setDrawerTab('insights'); }}>
                      <div className="flex items-center gap-4 cursor-pointer">
                        <img src={user.avatar || 'https://picsum.photos/seed/user/100'} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                        <div>
                          <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name || 'Unnamed'}</div>
                          <div className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${user.isOnline ? 'text-emerald-500' : 'text-slate-300'}`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${user.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                             {user.isOnline ? 'Active' : 'Offline'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role || 'UNASSIGNED'}</span>
                    </td>
                    <td className="px-8 py-6 text-center text-sm font-black text-slate-700">{stats.completedTasks}</td>
                    <td className="px-8 py-6 text-center text-sm font-black text-indigo-600">{stats.leadsGenerated}</td>
                    <td className="px-8 py-6 text-center text-sm font-black text-rose-600">{stats.overdueTasks}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{stats.slaPercentage || 0}%</span>
                        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${stats.slaPercentage > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${stats.slaPercentage || 0}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Timer size={14} className="text-slate-400" /> {stats.avgResponseTime || '—'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex items-center justify-center gap-1.5 text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                          <Layers size={14} /> {activeProjectCount}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full rounded-full transition-all duration-1000 ${getCapacityColor(stats.capacity)}`} style={{ width: `${stats.maxCapacity > 0 ? (stats.capacity / stats.maxCapacity) * 100 : 0}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-slate-700">{Math.round(stats.maxCapacity > 0 ? (stats.capacity / stats.maxCapacity) * 100 : 0)}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setRebalanceModal({ userId, allocations: 10 })}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm" 
                            title="Rebalance Load"
                          >
                             <Sliders size={14} />
                          </button>
                          <button 
                            onClick={() => setLockModal({ userId, locked: true })}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm" 
                            title="Lock Access"
                          >
                             <Lock size={14} />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sortedAndFilteredEmployees.length === 0 && (
             <div className="py-20 text-center text-slate-400">
                <Search size={48} className="mx-auto opacity-10 mb-4" />
                <p className="font-medium">No matching employee records found.</p>
             </div>
          )}
        </div>
      </div>

      {/* 4. RIGHT WORKFLOW DRAWER */}
      {selectedUserId && selectedEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/60 backdrop-blur-sm p-4 overflow-hidden animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white h-full rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col animate-in slide-in-from-right-10 duration-500 relative">
            
            <div className="p-10 pb-8 border-b border-slate-50 bg-slate-50/30">
               <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img src={selectedEmployee.avatar || 'https://picsum.photos/seed/user/120'} className="w-24 h-24 rounded-[32px] object-cover shadow-2xl border-4 border-white" />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${selectedEmployee.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    </div>
                    <div>
                       <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-1">{selectedEmployee.name || 'Unnamed'}</h2>
                       <div className="flex items-center gap-3">
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                            {selectedEmployee.role || 'UNASSIGNED'}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock size={14} /> Active now
                          </div>
                    </div>
                  </div>
                  </div>
                  <button onClick={() => setSelectedUserId(null)} className="p-4 bg-white border border-slate-100 rounded-[28px] hover:bg-slate-50 transition-colors shadow-sm text-slate-400 hover:text-indigo-600">
                    <X size={28} />
                  </button>
               </div>

               <div className="flex bg-white p-2 rounded-[24px] shadow-sm border border-slate-200 w-fit">
                  {[
                    { id: 'queue', label: 'Work Queue', icon: ClipboardList },
                    { id: 'assign', label: 'Assign & Allocate', icon: UserPlus },
                    { id: 'insights', label: 'Performance', icon: BarChart3 },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setDrawerTab(tab.id as any)}
                      className={`flex items-center gap-3 px-8 py-3.5 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all ${drawerTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
               </div>
            </div>

            {/* TAB 1: WORK QUEUE */}
            {drawerTab === 'queue' && (
              <div className="flex-1 overflow-y-auto p-10 no-scrollbar pb-40 space-y-10 animate-in fade-in duration-300">
                <div className="bg-slate-50/70 border border-slate-100 rounded-[32px] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Recent Activity</h4>
                    <span className="text-[10px] font-bold text-slate-400">Live</span>
                  </div>
                  <div className="space-y-3">
                    {tasks
                      .filter(t => t.assignedTo === selectedUserId)
                      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
                      .slice(0, 5)
                      .map(task => (
                        <div key={task._id || task.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-4 py-3">
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-slate-900">{task.title}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {task.status || 'ASSIGNED'} • {task.leadName || 'N/A'}
                            </div>
                          </div>
                          <div className="text-[10px] font-bold text-slate-400">
                            {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : '—'}
                          </div>
                        </div>
                      ))}
                    {tasks.filter(t => t.assignedTo === selectedUserId).length === 0 && (
                      <div className="text-xs text-slate-400">No activity yet.</div>
                    )}
                  </div>
                </div>
                {(() => {
                  const userTasks = tasks.filter(t => t.assignedTo === selectedUserId);
                  const tasksByProject = userTasks.reduce((acc: Record<string, any[]>, task: any) => {
                    const key = task.projectId || 'UNASSIGNED';
                    acc[key] = acc[key] || [];
                    acc[key].push(task);
                    return acc;
                  }, {});

                  const projectIds = Object.keys(tasksByProject);

                  if (projectIds.length === 0) {
                    return (
                      <div className="text-center text-slate-400 py-16">
                        <ClipboardList size={40} className="mx-auto mb-4 opacity-20" />
                        No tasks assigned yet.
                      </div>
                    );
                  }

                  return projectIds.map((projectId) => {
                    const project = projects.find(p => (p._id || p.id) === projectId);
                    const projectName = project?.name || (projectId === 'UNASSIGNED' ? 'Unassigned' : 'Unknown Project');
                    const projectTasks = tasksByProject[projectId] || [];
                    const isExpanded = expandedProjects.includes(projectId);

                    return (
                      <div key={projectId} className="space-y-4">
                        <button 
                          onClick={() => toggleProject(projectId)}
                          className="w-full flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 group"
                        >
                          <span className="flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                            <Briefcase size={14} /> {projectName}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-600">{projectTasks.length} ITEMS</span>
                            <ChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} size={16} />
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="space-y-3 animate-in slide-in-from-top-2">
                            {projectTasks.map(task => (
                              <div key={task._id || task.id} className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:border-indigo-200 hover:shadow-xl transition-all group relative">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex gap-2">
                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full ${task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600 uppercase'}`}>
                                      {task.priority || 'MEDIUM'} PRIORITY
                                    </span>
                                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 uppercase tracking-widest">
                                      {task.type || 'GENERAL'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                                    <Clock size={12} /> Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                                  </div>
                                </div>
                                <h4 className="text-base font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                                <div className="flex items-center gap-2 mb-6">
                                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">@</div>
                                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Lead: {task.leadName || 'N/A'}</span>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                  <button 
                                    onClick={() => handleCompleteTask(task._id || task.id)}
                                    disabled={taskActionLoading === (task._id || task.id)}
                                    className="py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex flex-col items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                                  >
                                    <Check size={14} /> Complete
                                  </button>
                                  <button 
                                    onClick={() => setRescheduleModal({ taskId: task._id || task.id, dueDate: '' })}
                                    className="py-3 bg-slate-50 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                                  >
                                    <CalendarClock size={14} /> Reschedule
                                  </button>
                                  <button 
                                    onClick={() => handleReassignTask(task._id || task.id)}
                                    disabled={taskActionLoading === (task._id || task.id)}
                                    className="py-3 bg-slate-50 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 transition-all flex flex-col items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                                  >
                                    <Repeat size={14} /> Reassign
                                  </button>
                                  <button 
                                    onClick={() => setNoteModal({ taskId: task._id || task.id, note: '' })}
                                    className="py-3 bg-slate-50 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all flex flex-col items-center justify-center gap-1 shadow-sm"
                                  >
                                    <Mail size={14} /> Add Note
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* TAB 2: ASSIGN & ALLOCATE */}
            {drawerTab === 'assign' && (
              <div className="flex-1 overflow-y-auto p-10 no-scrollbar pb-40 space-y-12 animate-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-6">
                   <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] px-1">1. Context & Task Logic</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Project <span className="text-rose-500">*</span></label>
                         <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[28px] text-xs font-black appearance-none focus:ring-8 focus:ring-indigo-500/5">
                           {projects.map(p => <option key={p._id || p.id}>{p.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Template</label>
                         <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[28px] text-xs font-black appearance-none focus:ring-8 focus:ring-indigo-500/5">
                            <option>Call Follow-up Chain</option>
                            <option>Initial Counseling</option>
                            <option>Document Request</option>
                         </select>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] px-1">2. Lead Ingestion Source</h4>
                   <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: LeadSource.WHATSAPP_AI, label: 'AI Hot Queue', icon: Bot, color: 'emerald' },
                        { id: LeadSource.TELECALLER_SHEET, label: 'Potentials', icon: FileText, color: 'indigo' },
                        { id: LeadSource.SOCIAL_MEDIA, label: 'Campaign DMs', icon: Smartphone, color: 'pink' },
                        { id: LeadSource.FIELD_MARKETING, label: 'Field Leads', icon: MapPin, color: 'amber' },
                      ].map(src => (
                        <button key={src.id} className="p-6 rounded-[40px] border-2 border-slate-50 hover:border-indigo-600 hover:bg-indigo-50/20 transition-all flex flex-col items-center gap-3 text-center group relative overflow-hidden shadow-sm">
                           <div className={`p-4 bg-${src.color}-50 text-${src.color}-600 rounded-3xl group-hover:scale-110 transition-transform`}>
                              <src.icon size={28} />
                           </div>
                           <div className="text-[11px] font-black uppercase text-slate-900 tracking-tight">{src.label}</div>
                           <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{leadSourceCounts[src.id] || 0} available</div>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] px-1">3. Batch Allocation Quota</h4>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Load-Balanced</span>
                   </div>
                   <div className="p-8 bg-slate-50 rounded-[48px] border border-slate-100 shadow-inner flex items-center gap-10">
                      <div className="flex-1 space-y-4">
                         <input 
                           type="range" 
                           className="w-full h-2 bg-slate-200 rounded-full appearance-none accent-indigo-600 cursor-pointer" 
                           min="1" max="25" 
                           value={allocationVolume} 
                           onChange={e => setAllocationVolume(parseInt(e.target.value))} 
                         />
                      </div>
                      <div className="text-7xl font-black text-slate-900 tabular-nums tracking-tighter w-24">{allocationVolume.toString().padStart(2, '0')}</div>
                   </div>
                </div>

                <div className="p-10 bg-slate-900 rounded-[56px] text-white relative overflow-hidden group shadow-2xl">
                   <ShieldAlert className="absolute -right-12 -bottom-12 w-64 h-64 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                   <div className="relative z-10 space-y-8">
                      <div>
                         <div className="flex items-center gap-2 text-indigo-300 font-black text-[11px] uppercase tracking-[0.2em] mb-4">
                            <Activity size={16} className="text-rose-500 animate-pulse" /> Capacity Utilization Audit
                         </div>
                         <div className="flex items-end gap-3 mb-2">
                            <div className="text-6xl font-black tracking-tighter">88%</div>
                            <div className="text-xs font-bold text-slate-400 uppercase pb-2">Projected Load</div>
                         </div>
                         <p className="text-xs text-indigo-100/60 font-medium leading-relaxed italic max-w-sm">
                            Adding {allocationVolume} tasks will push {selectedEmployee.name} to high capacity ({((selectedStats?.capacity || 0) + allocationVolume)/10 * 100}%). System suggests D+2 spacing for follow-up reminders.
                         </p>
                      </div>
                      <div className="space-y-4">
                         <label className="flex items-center gap-4 cursor-pointer group">
                            <input type="checkbox" defaultChecked className="w-6 h-6 rounded-lg border-white/20 bg-white/5 text-indigo-600 focus:ring-0 cursor-pointer" />
                            <div className="flex flex-col">
                               <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Auto-Create Follow-up Chain</span>
                               <span className="text-[9px] text-slate-400">Completion will spawn the next logical interaction step automatically.</span>
                            </div>
                         </label>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* TAB 3: PERFORMANCE BREAKDOWN */}
            {drawerTab === 'insights' && (
              <div className="flex-1 overflow-y-auto p-10 no-scrollbar space-y-10 animate-in fade-in duration-300 pb-40">
                 <div className="p-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[56px] text-white flex flex-col items-center gap-8 text-center shadow-2xl relative overflow-hidden group">
                    <Sparkles className="absolute top-8 right-8 w-16 h-16 opacity-20 group-hover:rotate-12 transition-transform" />
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30">
                       <Award size={48} className="text-indigo-100" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black tracking-tight uppercase leading-none">Performance Elite</h3>
                       <p className="text-indigo-100/80 text-sm font-medium leading-relaxed max-w-sm mx-auto">Currently processing 22% more leads than the squad average this quarter.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                       <div className="bg-white/10 rounded-3xl p-5 border border-white/10 backdrop-blur-md">
                          <div className="text-[10px] font-black text-indigo-200 uppercase mb-1">Quality Score</div>
                          <div className="text-2xl font-black">9.4/10</div>
                       </div>
                       <div className="bg-white/10 rounded-3xl p-5 border border-white/10 backdrop-blur-md">
                          <div className="text-[10px] font-black text-indigo-200 uppercase mb-1">Rank</div>
                          <div className="text-2xl font-black">#02 / 12</div>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: 'Completed Tasks', value: selectedStats?.completedTasks || 0, icon: CheckCircle2, color: 'emerald' },
                      { label: 'Leads Generated', value: selectedStats?.leadsGenerated || 0, icon: Zap, color: 'indigo' },
                      { label: 'Qualified Conversions', value: selectedStats?.conversions || 0, icon: Target, color: 'rose' },
                      { label: 'Avg Call Resolution', value: selectedStats?.avgResponseTime || 'N/A', icon: Phone, color: 'amber' },
                    ].map((m, i) => (
                      <div key={i} className="p-8 bg-slate-50 border border-slate-100 rounded-[40px] flex items-center justify-between group hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all">
                         <div className="flex items-center gap-5">
                            <div className={`p-4 bg-${m.color}-50 text-${m.color}-600 rounded-2xl group-hover:scale-110 transition-transform shadow-sm`}><m.icon size={24} /></div>
                            <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{m.label}</span>
                         </div>
                         <span className="text-2xl font-black text-slate-900 tracking-tighter">{m.value}</span>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            <div className="absolute bottom-0 inset-x-0 p-10 bg-white/95 backdrop-blur-2xl border-t border-slate-100 flex flex-col gap-3 shadow-[0_-20px_60px_rgba(0,0,0,0.08)] z-30">
               {drawerTab === 'assign' ? (
                  <div className="grid grid-cols-4 gap-3">
                     <button className="col-span-3 py-6 bg-indigo-600 text-white rounded-[32px] text-sm font-black uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95 group">
                        <CheckCircle2 size={24} className="group-hover:rotate-12 transition-transform" /> Deploy Batch Injection
                     </button>
                     <button className="col-span-1 py-6 bg-slate-900 text-white rounded-[32px] flex items-center justify-center hover:bg-slate-800 transition-all shadow-xl">
                        <Bell size={24} />
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-6 bg-slate-900 text-white rounded-[32px] text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 group shadow-2xl">
                       <Mail size={22} className="group-hover:scale-110 transition-transform" /> Notify Staff
                    </button>
                    <button className="py-6 bg-white border-2 border-slate-200 text-slate-900 rounded-[32px] text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                       <Fingerprint size={22} /> Audit Trail
                    </button>
                  </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <CalendarClock className="text-indigo-600" size={28} />
              Reschedule Task
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 block">New Due Date</label>
                <input 
                  type="date"
                  value={rescheduleModal.dueDate}
                  onChange={(e) => setRescheduleModal({...rescheduleModal, dueDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setRescheduleModal(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRescheduleTask}
                  disabled={taskActionLoading === rescheduleModal.taskId || !rescheduleModal.dueDate}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {taskActionLoading === rescheduleModal.taskId ? 'Updating...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Mail className="text-indigo-600" size={28} />
              Add Note to Task
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 block">Note</label>
                <textarea 
                  value={noteModal.note}
                  onChange={(e) => setNoteModal({...noteModal, note: e.target.value})}
                  placeholder="Add your note here..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setNoteModal(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddNote}
                  disabled={taskActionLoading === noteModal.taskId || !noteModal.note}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {taskActionLoading === noteModal.taskId ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rebalance Load Modal */}
      {rebalanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Sliders className="text-amber-600" size={28} />
              Rebalance Workload
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 block">Max Capacity</label>
                <div className="space-y-4">
                  <input 
                    type="range"
                    min="5"
                    max="25"
                    value={rebalanceModal.allocations}
                    onChange={(e) => setRebalanceModal({...rebalanceModal, allocations: parseInt(e.target.value)})}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none accent-amber-500 cursor-pointer"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">Current</span>
                    <span className="text-3xl font-black text-amber-600">{rebalanceModal.allocations}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setRebalanceModal(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRebalanceLoad}
                  disabled={taskActionLoading === rebalanceModal.userId}
                  className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {taskActionLoading === rebalanceModal.userId ? 'Updating...' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lock Access Modal */}
      {lockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Lock className="text-rose-600" size={28} />
              {lockModal.locked ? 'Lock' : 'Unlock'} Account Access
            </h3>
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  {lockModal.locked 
                    ? 'This employee will not be able to access assignments and tasks.' 
                    : 'This employee will regain access to assignments and tasks.'}
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setLockModal(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLockAccess}
                  disabled={taskActionLoading === lockModal.userId}
                  className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {taskActionLoading === lockModal.userId ? 'Updating...' : (lockModal.locked ? 'Lock' : 'Unlock')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[101] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Create Employee Account</h2>
              <button
                onClick={() => setShowCreateAccountModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            {accountError && (
              <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-sm font-bold text-rose-700">{accountError}</p>
              </div>
            )}

            {accountSuccess && (
              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm font-bold text-emerald-700">{accountSuccess}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter employee name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Email Address *</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Role & Tags *</label>
                <select
                  value={newAccount.role}
                  onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <optgroup label="🎯 Operational Roles">
                    <option value={UserRole.TELECALLER}>📞 Telecaller - Makes calls & tracks leads</option>
                    <option value={UserRole.COUNSELOR}>🎓 Counselor - Guides students</option>
                    <option value={UserRole.FIELD_MARKETING}>👥 Field Marketing Officer - Seminars & events</option>
                  </optgroup>
                  <optgroup label="⚙️ Management & Support">
                    <option value={UserRole.SOCIAL_MEDIA}>📱 Social Media Manager - Online campaigns</option>
                    <option value={UserRole.AGENT_MANAGER}>🤖 AI Agent Manager - Bot supervision</option>
                    <option value={UserRole.AI_OPERATOR}>🔧 AI Operator - Bot operations</option>
                    <option value={UserRole.ADMIN}>👑 Administrator - Full system access</option>
                  </optgroup>
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  {newAccount.role === UserRole.TELECALLER && '📞 Can make calls, mark potential leads, and update statuses'}
                  {newAccount.role === UserRole.COUNSELOR && '🎓 Can counsel students and manage educational programs'}
                  {newAccount.role === UserRole.FIELD_MARKETING && '👥 Can create forms and manage seminar leads'}
                  {newAccount.role === UserRole.SOCIAL_MEDIA && '📱 Can manage social campaigns and online presence'}
                  {newAccount.role === UserRole.AGENT_MANAGER && '🤖 Can supervise AI bots and automation'}
                  {newAccount.role === UserRole.AI_OPERATOR && '🔧 Can operate and monitor AI systems'}
                  {newAccount.role === UserRole.ADMIN && '👑 Has full system access and control'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Password *</label>
                <input
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Confirm Password *</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={newAccount.confirmPassword}
                  onChange={(e) => setNewAccount({ ...newAccount, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateAccount}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} /> Create Account
                </button>
                <button
                  onClick={() => setShowCreateAccountModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default EmployeeProductivity;

