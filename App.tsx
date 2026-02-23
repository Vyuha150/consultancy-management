
import React, { useState, useCallback, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LeadManagement from './components/LeadManagement';
import LeadDetail from './components/LeadDetail';
import TelecallerManagement from './components/TelecallerManagement';
import AIAgentConsole from './components/AIAgentConsole';
import CounselorProfiles from './components/CounselorProfiles';
import MyTasks from './components/MyTasks';
import ProjectAssignmentCenter from './components/ProjectAssignmentCenter';
import SocialMediaManagement from './components/SocialMediaManagement';
import FieldMarketing from './components/FieldMarketing';
import ReferralManagement from './components/ReferralManagement';
import EmployeeProductivity from './components/EmployeeProductivity';
import Settings from './components/Settings';
import Login from './components/Login';
import { MOCK_LEADS } from './constants';
import { User, UserRole, Lead } from './types';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('edulead_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setActiveTab(getLandingTab(user.role));
      } catch (err) {
        console.error('Failed to restore user session:', err);
        localStorage.removeItem('edulead_user');
      }
    }
    setLoading(false);
  }, []);

  const getLandingTab = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return 'dashboard';
      case UserRole.AI_OPERATOR:
        return 'dashboard';
      case UserRole.TELECALLER:
        return 'telecaller';
      case UserRole.COUNSELOR:
        return 'leads';
      case UserRole.SOCIAL_MEDIA:
        return 'social';
      case UserRole.FIELD_MARKETING:
        return 'field';
      case UserRole.AGENT_MANAGER:
        return 'referrals';
      default:
        return 'dashboard';
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('edulead_user');
    setActiveTab('dashboard');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('edulead_user', JSON.stringify(user));
    setActiveTab(getLandingTab(user.role));
  };

  const handleLeadSelect = useCallback((lead: Lead | string) => {
    if (typeof lead === 'string') {
      const found = MOCK_LEADS.find(l => l.id === lead);
      if (found) setSelectedLead(found);
    } else {
      setSelectedLead(lead);
    }
  }, []);

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'assignment':
        return <ProjectAssignmentCenter onLeadClick={handleLeadSelect} />;
      case 'leads':
        return (
          <LeadManagement 
            onLeadClick={(lead) => handleLeadSelect(lead.id)} 
            currentUserRole={currentUser.role}
            currentUserId={currentUser.id}
          />
        );
      case 'telecaller':
        return (
          <TelecallerManagement 
            currentUserRole={currentUser.role} 
            currentUserId={currentUser.id} 
          />
        );
      case 'ai-bot':
        return <AIAgentConsole />;
      case 'counselor-docs':
        return <CounselorProfiles />;
      case 'tasks':
        return (
          <MyTasks 
            currentUserRole={currentUser.role} 
            currentUserId={currentUser.id} 
          />
        );
      case 'social':
        return <SocialMediaManagement />;
      case 'field':
        return <FieldMarketing currentUserRole={currentUser.role} />;
      case 'referrals':
        return <ReferralManagement />;
      case 'employees':
        return <EmployeeProductivity />;
      case 'settings':
        return <Settings userId={currentUser.id} onLogout={handleLogout} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <span className="text-2xl">?</span>
             </div>
             <p className="font-medium text-lg">Work in Progress</p>
             <p className="text-sm">The "{activeTab}" module is currently being configured.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if no user is logged in
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      currentUser={currentUser} 
      onLogout={handleLogout}
    >
      {renderContent()}
      {selectedLead && (
        <LeadDetail 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
        />
      )}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
