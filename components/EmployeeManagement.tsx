
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight, 
  History, 
  LayoutGrid, 
  Settings2,
  Lock,
  Eye,
  Activity,
  UserCog,
  Trash2,
  CheckCircle2,
  X,
  Plus,
  Network
} from 'lucide-react';
import { MOCK_USERS, MOCK_TEAMS, MOCK_ACTIVITY_LOGS } from '../constants';
import { User, Team, UserRole, DataScope, ActivityLog } from '../types';

const EmployeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'teams' | 'logs'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
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

  const handleCreateAccount = async () => {
    setAccountError('');
    setAccountSuccess('');

    // Validation
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

  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const getRoleBadge = (role: UserRole) => {
    const badges = {
      [UserRole.SUPER_ADMIN]: 'bg-purple-50 text-purple-700 border-purple-200',
      [UserRole.ADMIN]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      [UserRole.TELECALLER]: 'bg-blue-50 text-blue-700 border-blue-200',
      [UserRole.COUNSELOR]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      [UserRole.FIELD_MARKETING]: 'bg-amber-50 text-amber-700 border-amber-200',
      [UserRole.SOCIAL_MEDIA]: 'bg-rose-50 text-rose-700 border-rose-200',
      [UserRole.AGENT_MANAGER]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      [UserRole.AI_OPERATOR]: 'bg-teal-50 text-teal-700 border-teal-200'
    };
    return badges[role] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      [UserRole.SUPER_ADMIN]: '👑',
      [UserRole.ADMIN]: '🛡️',
      [UserRole.TELECALLER]: '📞',
      [UserRole.COUNSELOR]: '🎓',
      [UserRole.FIELD_MARKETING]: '👥',
      [UserRole.SOCIAL_MEDIA]: '📱',
      [UserRole.AGENT_MANAGER]: '🤖',
      [UserRole.AI_OPERATOR]: '🔧'
    };
    return icons[role] || '👤';
  };

  const getScopeBadge = (scope: DataScope) => {
    switch (scope) {
      case DataScope.ALL_LEADS: return 'bg-indigo-100 text-indigo-700';
      case DataScope.TEAM_ONLY: return 'bg-amber-100 text-amber-700';
      case DataScope.ONLY_ASSIGNED: return 'bg-sky-100 text-sky-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Workspace Governance</h1>
          <p className="text-sm text-slate-500 font-medium">Control role-based access, team assignments, and data transparency.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          {[
            { id: 'employees', label: 'Directory', icon: Users },
            { id: 'teams', label: 'Teams', icon: Network },
            { id: 'logs', label: 'Audit Logs', icon: History },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'employees' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           {/* Quick Add Employee Card */}
           <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[32px] border border-indigo-100 shadow-sm p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserPlus className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">Add New Employee</h3>
                    <p className="text-sm text-slate-600">Create accounts for Telecallers, Counselors, Field Officers & more with email and password</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateAccountModal(true)}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-wider hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:scale-105"
                >
                  + Add Employee
                </button>
              </div>
           </div>

           <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[300px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search staff by name, email or role..." 
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm font-medium text-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3 items-center">
                <div className="hidden lg:block text-right mr-2">
                  <p className="text-xs font-bold text-slate-600">Create new employees with</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span>📞 Telecaller</span>
                    <span>•</span>
                    <span>🎓 Counselor</span>
                    <span>•</span>
                    <span>👥 Field Officer</span>
                  </p>
                </div>
                <button 
                  onClick={() => setShowCreateAccountModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                >
                  <UserPlus size={16} /> Create Account
                </button>
              </div>
           </div>

           <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role & Permissions</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Grouping</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Visibility</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                            <div>
                               <div className="text-sm font-black text-slate-900">{user.name}</div>
                               <div className="text-[10px] text-slate-400 font-bold uppercase">{user.email}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getRoleBadge(user.role)}`}>
                           <span className="text-sm">{getRoleIcon(user.role)}</span>
                           <span className="text-xs font-bold">{user.role.replace('_', ' ')}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-xs font-bold text-slate-700">
                           {MOCK_TEAMS.find(t => t.id === user.teamId)?.name || 'Central'}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${getScopeBadge(user.dataScope)}`}>
                            {user.dataScope.replace('_', ' ')}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{user.lastActive || 'Never'}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button 
                           onClick={() => setEditingUser(user)}
                           className="p-2 text-slate-300 hover:text-indigo-600 transition-colors border border-transparent hover:border-slate-100 rounded-lg"
                         >
                            <Settings2 size={18} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
           {MOCK_TEAMS.map(team => (
             <div key={team.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:border-indigo-200 transition-all flex flex-col gap-6 group">
                <div className="flex justify-between items-start">
                   <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Network size={24} />
                   </div>
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-600">
                        +{team.memberCount - 3}
                      </div>
                   </div>
                </div>

                <div>
                   <h3 className="text-xl font-black text-slate-900 mb-1">{team.name}</h3>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">{team.description}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                   <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Lead</div>
                      <div className="text-sm font-bold text-slate-900">{MOCK_USERS.find(u => u.id === team.leadId)?.name}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</div>
                      <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{team.type}</div>
                   </div>
                </div>

                <div className="flex gap-2">
                   <button className="flex-1 py-3 bg-white border border-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                      Manage Members
                   </button>
                   <button className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 transition-all rounded-xl">
                      <Trash2 size={16} />
                   </button>
                </div>
             </div>
           ))}
           <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all group">
              <Plus size={32} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Create New Team</span>
           </button>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
              <Activity className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 max-w-2xl">
                 <h2 className="text-3xl font-black">Global Activity Stream</h2>
                 <p className="text-slate-400 text-sm font-medium mt-2">Real-time audit logs of every critical operation within the CRM pipeline.</p>
              </div>
           </div>

           <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Latest Audit Logs</h3>
                 <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Download CSV Report</button>
              </div>
              <div className="divide-y divide-slate-50">
                {MOCK_ACTIVITY_LOGS.map(log => (
                  <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                           <History size={18} />
                        </div>
                        <div>
                           <div className="text-sm font-bold text-slate-900">{log.action.replace('_', ' ')}</div>
                           <div className="text-xs text-slate-500">{log.details}</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-xs font-black text-slate-900">{log.userName}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{new Date(log.timestamp).toLocaleTimeString()}</div>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* Permissions & Scope Drawer */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white h-full rounded-[48px] shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-500 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
               <div className="flex items-center gap-6">
                  <img src={editingUser.avatar} className="w-20 h-20 rounded-[32px] object-cover shadow-2xl" alt="" />
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{editingUser.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{editingUser.role}</p>
                  </div>
               </div>
               <button onClick={() => setEditingUser(null)} className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                 <X size={24} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
               {/* Role Selection */}
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} /> System Role Assignment
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(UserRole).map(role => (
                      <button 
                        key={role}
                        className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${editingUser.role === role ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'}`}
                      >
                        {role.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
               </div>

               {/* Data Scope Section */}
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Lock size={14} /> Data Visibility Scope
                  </h4>
                  <div className="space-y-3">
                     {[
                       { id: DataScope.ONLY_ASSIGNED, label: 'Only Assigned Leads', desc: 'Can only view leads explicitly assigned to them.' },
                       { id: DataScope.TEAM_ONLY, label: 'Team Leads Only', desc: 'Can view all leads belonging to their assigned team.' },
                       { id: DataScope.ALL_LEADS, label: 'Global Access', desc: 'Full transparency across all acquisition channels.' }
                     ].map(scope => (
                       <div 
                         key={scope.id}
                         onClick={() => setEditingUser({...editingUser, dataScope: scope.id})}
                         className={`p-5 rounded-[28px] border-2 cursor-pointer transition-all ${editingUser.dataScope === scope.id ? 'bg-indigo-50/50 border-indigo-600' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                       >
                          <div className="flex items-center justify-between mb-1">
                             <div className="text-sm font-black text-slate-900">{scope.label}</div>
                             {editingUser.dataScope === scope.id && <CheckCircle2 size={18} className="text-indigo-600" />}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">{scope.desc}</p>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Team Relocation */}
               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Network size={14} /> Team Assignment
                  </h4>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                    value={editingUser.teamId}
                  >
                     {MOCK_TEAMS.map(team => (
                       <option key={team.id} value={team.id}>{team.name}</option>
                     ))}
                  </select>
               </div>
            </div>

            <div className="p-10 bg-slate-900 flex flex-col gap-3">
               <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] text-sm font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/20">
                 <CheckCircle2 size={20} /> Deploy Access Rules
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Team Assignment</label>
                <select
                  value={newAccount.teamId}
                  onChange={(e) => setNewAccount({ ...newAccount, teamId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a team (optional)</option>
                  {MOCK_TEAMS.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
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
    </div>
  );
};

export default EmployeeManagement;
