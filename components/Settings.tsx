
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Save,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  LogOut,
  Globe
} from 'lucide-react';
import { MOCK_SYSTEM_SETTINGS } from '../constants';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
  phone: string;
  department: string;
  joinDate: string;
  lastLogin: string;
  performanceMetrics: {
    leadsHandled: number;
    conversions: number;
    successRate: number;
  };
}

interface SettingsComponentProps {
  userId?: string;
  onLogout?: () => void;
}

const SettingsComponent: React.FC<SettingsComponentProps> = ({ userId, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'pipeline'>('profile');
  const [settings, setSettings] = useState(MOCK_SYSTEM_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    if (userId && activeTab === 'profile') {
      fetchUserProfile();
    }
  }, [userId, activeTab]);

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/user/profile?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Logic for actual saving would go here
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full gap-8">
      {/* Settings Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Settings className="text-indigo-600" size={32} />
             System Configuration
          </h1>
          <p className="text-slate-500 font-medium">Manage global business logic, data masters, and compliance rules.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50"
        >
          {isSaving ? 'Synchronizing...' : (
            <>
              <Save size={18} /> Deploy Changes
            </>
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-8 min-h-0">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 space-y-1">
          {[
            { id: 'profile', label: 'My Profile', icon: UserIcon },
            { id: 'pipeline', label: 'Pipeline & Stages', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content Panel */}
        <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
           {activeTab === 'profile' && (
             <div className="p-10 space-y-8 animate-in fade-in duration-500">
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="space-y-2">
                         <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <UserIcon size={28} className="text-indigo-600" />
                            My Profile
                         </h3>
                         <p className="text-xs text-slate-500 font-medium">Your account information and performance metrics</p>
                      </div>
                      <button 
                        onClick={handleLogoutClick}
                        className="flex items-center gap-2 px-6 py-3 bg-rose-100 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-200 transition-all shadow-sm"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                   </div>

                   {loading ? (
                      <div className="flex items-center justify-center h-48">
                        <div className="text-slate-400">Loading profile...</div>
                      </div>
                   ) : userProfile ? (
                      <>
                         {/* Profile Header - Simplified */}
                         <div className="flex items-center gap-6 py-6">
                            <img 
                              src={userProfile.avatar} 
                              alt={userProfile.name}
                              className="w-16 h-16 rounded-full border-4 border-indigo-200"
                            />
                            <div>
                               <h2 className="text-2xl font-black text-slate-900">{userProfile.name}</h2>
                               <p className="text-sm font-bold text-indigo-600">{userProfile.role}</p>
                               <p className="text-xs text-slate-500 mt-1">{userProfile.email}</p>
                            </div>
                         </div>

                         {/* Performance Stats - Clean Grid */}
                         <div className="grid grid-cols-3 gap-4">
                            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                               <div className="text-3xl font-black text-emerald-600">{userProfile.performanceMetrics.leadsHandled}</div>
                               <div className="text-[10px] font-bold text-emerald-700 uppercase mt-2">Leads</div>
                            </div>
                            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
                               <div className="text-3xl font-black text-indigo-600">{userProfile.performanceMetrics.conversions}</div>
                               <div className="text-[10px] font-bold text-indigo-700 uppercase mt-2">Conversions</div>
                            </div>
                            <div className="p-6 bg-violet-50 rounded-2xl border border-violet-100 text-center">
                               <div className="text-3xl font-black text-violet-600">{userProfile.performanceMetrics.successRate.toFixed(1)}%</div>
                               <div className="text-[10px] font-bold text-violet-700 uppercase mt-2">Success Rate</div>
                            </div>
                         </div>
                      </>
                   ) : (
                      <div className="flex items-center justify-center h-48">
                        <div className="text-slate-400">Failed to load profile data</div>
                      </div>
                   )}
                </div>
             </div>
           )}

           {activeTab === 'pipeline' && (
             <div className="p-10 space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-slate-900">Pipeline Progression</h3>
                   <p className="text-xs text-slate-500 font-medium">Configure the stages a student lead moves through during the admission cycle.</p>
                </div>

                <div className="space-y-3">
                   {settings.pipelineStages.map((stage, idx) => (
                     <div key={stage.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }}></div>
                           <span className="text-sm font-black text-slate-900">{stage.label}</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SettingsComponent;
