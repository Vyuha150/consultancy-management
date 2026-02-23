
import React, { useState, useMemo, useEffect } from 'react';
import { 
  List, 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  Filter, 
  Search, 
  MoreHorizontal, 
  Download, 
  UserPlus, 
  Trash2, 
  CheckCircle,
  X,
  ChevronRight,
  Flag,
  ChevronDown,
  Plus,
  AlertCircle,
  Phone,
  Mail,
  Copy,
  Edit2,
  FileText
} from 'lucide-react';
import { MOCK_USERS } from '../constants';
import { UserRole } from '../types';

interface Lead {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  pipeline: string;
  qualificationScore: number;
  interestedCountries: string[];
  interestedPrograms: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  followUpDate: string;
  assignedTo: string | null;
}

interface LeadManagementProps {
  onLeadClick?: (lead: Lead) => void;
  currentUserRole: UserRole;
  currentUserId: string;
}

type DocKey = 'marksheet' | 'certificate' | 'transcript' | 'consolidated' | 'resume' | 'sop' | 'passport';

const LeadManagement: React.FC<LeadManagementProps> = ({ onLeadClick, currentUserRole, currentUserId }) => {
  const [view, setView] = useState<'table' | 'kanban' | 'calendar'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentTargetIds, setAssignmentTargetIds] = useState<string[]>([]);
  const [assignmentUserId, setAssignmentUserId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [creatingLead, setCreatingLead] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    aadhar: ''
  });
  const [docFiles, setDocFiles] = useState<Record<DocKey, File | null>>({
    marksheet: null,
    certificate: null,
    transcript: null,
    consolidated: null,
    resume: null,
    sop: null,
    passport: null
  });
  const [lorFiles, setLorFiles] = useState<(File | null)[]>([null]);
  const [profileUploading, setProfileUploading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'MANUAL_ENTRY',
    pipeline: 'NEW'
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileCheckLoading, setProfileCheckLoading] = useState(false);
  
  // Advanced Filters State
  const [filters, setFilters] = useState({
    source: '',
    pipeline: '',
    status: ''
  });

  // Fetch leads from database
  useEffect(() => {
    fetchLeads();
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentUserRole === 'COUNSELOR') {
      fetchUserProfile();
    }
  }, [currentUserRole, currentUserId]);

  const fetchUserProfile = async () => {
    setProfileCheckLoading(true);
    try {
      const response = await fetch('/api/counselor-profile');
      if (response.ok) {
        const data = await response.json();
        const profiles = Array.isArray(data.profiles) ? data.profiles : [];
        const myProfile = profiles.find(p => p.counselorId === currentUserId);
        if (myProfile) {
          setUserProfile(myProfile);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setProfileCheckLoading(false);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (filters.source) query.append('source', filters.source);
      if (filters.pipeline) query.append('pipeline', filters.pipeline);
      if (filters.status) query.append('status', filters.status);

      const response = await fetch(`/api/leads?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const normalized = (Array.isArray(data) ? data : []).map((lead: any) => ({
          ...lead,
          pipeline: lead.pipeline || lead.stage || 'NEW',
          qualificationScore: lead.qualificationScore ?? lead.aiMetrics?.interestScore ?? 50,
          interestedCountries: lead.interestedCountries || lead.countryPreference || [],
          interestedPrograms: lead.interestedPrograms || (lead.program ? [lead.program] : []),
          status: lead.status || 'ACTIVE',
          followUpDate: lead.followUpDate || lead.nextFollowUp || null
        }));
        setLeads(normalized);
      } else {
        setError('Failed to load leads');
      }
    } catch (err) {
      setError('Error fetching leads');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const name = (lead.name ?? '').toLowerCase();
      const email = (lead.email ?? '').toLowerCase();
      const phone = (lead.phone ?? '').toLowerCase();
      const search = searchTerm.toLowerCase();
      const matchesSearch = name.includes(search) || email.includes(search) || phone.includes(search);
      return matchesSearch;
    });
  }, [searchTerm, leads]);

  const toggleLeadSelection = (id: string) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l._id || l.id).filter(Boolean) as string[]);
    }
  };

  const openLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  const openAssignModal = (leadIds: string[]) => {
    setAssignmentTargetIds(leadIds);
    setAssignmentUserId('');
    setShowAssignModal(true);
  };

  const handleAssignLeads = async () => {
    if (!assignmentUserId || assignmentTargetIds.length === 0) return;
    setAssigning(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: assignmentTargetIds, assignedTo: assignmentUserId })
      });

      if (response.ok) {
        setLeads(prev => prev.map(l => {
          const leadId = l._id || l.id;
          if (leadId && assignmentTargetIds.includes(leadId)) {
            return { ...l, assignedTo: assignmentUserId };
          }
          return l;
        }));
        setSelectedLeads([]);
        setShowAssignModal(false);
      } else {
        const errorText = await response.text();
        alert(errorText || 'Failed to assign leads');
      }
    } catch (err) {
      console.error('Assign leads error:', err);
      alert('Failed to assign leads');
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateLead = async () => {
    if (!newLead.name || !newLead.email || !newLead.phone) {
      alert('Name, email, and phone are required');
      return;
    }
    setCreatingLead(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });

      if (response.ok) {
        setShowAddLeadModal(false);
        setNewLead({ name: '', email: '', phone: '', source: 'MANUAL_ENTRY', pipeline: 'NEW' });
        fetchLeads();
      } else {
        const errorText = await response.text();
        alert(errorText || 'Failed to create lead');
      }
    } catch (err) {
      console.error('Create lead error:', err);
      alert('Failed to create lead');
    } finally {
      setCreatingLead(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchLeads();
        setOpenDropdown(null);
      } else {
        alert('Failed to delete lead');
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Error deleting lead');
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newPipeline: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline: newPipeline })
      });

      if (response.ok) {
        fetchLeads();
        setOpenDropdown(null);
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Error updating status');
    }
  };

  const handleMarkAsConverted = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline: 'CONVERTED' })
      });

      if (response.ok) {
        fetchLeads();
        setOpenDropdown(null);
      } else {
        alert('Failed to update lead');
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
      alert('Error updating lead');
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    alert('Phone number copied to clipboard');
    setOpenDropdown(null);
  };

  const handleCallLead = (phone: string) => {
    window.location.href = `tel:${phone}`;
    setOpenDropdown(null);
  };

  const handleEmailLead = (email: string) => {
    window.location.href = `mailto:${email}`;
    setOpenDropdown(null);
  };

  const handleDuplicateLead = async (lead: Lead) => {
    try {
      const newLead = {
        name: `${lead.name} (Copy)`,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        pipeline: 'NEW'
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });

      if (response.ok) {
        fetchLeads();
        setOpenDropdown(null);
        alert('Lead duplicated successfully');
      } else {
        alert('Failed to duplicate lead');
      }
    } catch (error) {
      console.error('Failed to duplicate lead:', error);
      alert('Error duplicating lead');
    }
  };

  const getPipelineColor = (pipeline: string) => {
    switch (pipeline) {
      case 'NEW': return 'bg-sky-100 text-sky-700';
      case 'CONTACTED': return 'bg-blue-100 text-blue-700';
      case 'QUALIFIED': return 'bg-indigo-100 text-indigo-700';
      case 'COUNSELING': return 'bg-purple-100 text-purple-700';
      case 'APPLIED': return 'bg-amber-100 text-amber-700';
      case 'OFFER': return 'bg-violet-100 text-violet-700';
      case 'CONVERTED': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700';
    if (score >= 70) return 'bg-blue-50 text-blue-700';
    if (score >= 50) return 'bg-amber-50 text-amber-700';
    return 'bg-rose-50 text-rose-700';
  };

  const isAdmin = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.SUPER_ADMIN;
  const isCounselor = currentUserRole === UserRole.COUNSELOR;

  const handleProfileUpload = async () => {
    setProfileError(null);
    setProfileSuccess(null);

    if (!profileData.fullName || !profileData.mobile || !profileData.email || !profileData.aadhar) {
      setProfileError('Please fill in all personal details.');
      return;
    }

    const requiredDocs: DocKey[] = [
      'marksheet',
      'certificate',
      'transcript',
      'consolidated',
      'resume',
      'sop',
      'passport'
    ];

    const missingDocs = requiredDocs.filter((key) => !docFiles[key]);
    const hasLor = lorFiles.some((file) => Boolean(file));

    if (missingDocs.length > 0 || !hasLor) {
      setProfileError('Please upload all required documents, including at least one LOR.');
      return;
    }

    setProfileUploading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', profileData.fullName);
      formData.append('mobile', profileData.mobile);
      formData.append('email', profileData.email);
      formData.append('aadhar', profileData.aadhar);
      formData.append('counselorId', currentUserId);

      requiredDocs.forEach((key) => {
        const file = docFiles[key];
        if (file) formData.append(key, file);
      });

      lorFiles.filter(Boolean).forEach((file) => {
        formData.append('lorFiles', file as File);
      });

      const response = await fetch('/api/counselor-profile', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Upload failed');
      }

      setProfileSuccess('Profile uploaded successfully.');
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to upload profile.');
    } finally {
      setProfileUploading(false);
      fetchUserProfile();
    }
  };


  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Lead Pipeline</h1>
          <p className="text-sm text-slate-500">All leads from database. Manage, track, and convert prospects.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setView('table')}
            className={`p-2 rounded-lg transition-all ${view === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            title="Table View"
          >
            <List size={20} />
          </button>
          <button 
            onClick={() => setView('kanban')}
            className={`p-2 rounded-lg transition-all ${view === 'kanban' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            title="Kanban Board"
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`p-2 rounded-lg transition-all ${view === 'calendar' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            title="Calendar View"
          >
            <CalendarIcon size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {isCounselor && (
        <>
          {userProfile && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[32px] border border-emerald-200 shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-black text-emerald-900">Your Profile Status</h2>
                  <p className="text-sm text-emerald-700 mt-1">Profile: <span className="font-bold">{userProfile.fullName}</span></p>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-emerald-200">
                  <div className={`w-2 h-2 rounded-full ${
                    userProfile.status === 'Verified' ? 'bg-emerald-500' : 
                    userProfile.status === 'Rejected' ? 'bg-rose-500' : 
                    'bg-amber-500'
                  }`} />
                  <span className="text-xs font-bold text-emerald-700">{userProfile.status || 'Pending'}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">Documents</div>
                  <div className="text-2xl font-black text-emerald-900 mt-1">{userProfile.totalDocs}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">LOR Files</div>
                  <div className="text-2xl font-black text-emerald-900 mt-1">{userProfile.lorCount}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">Last Upload</div>
                  <div className="text-xs font-semibold text-emerald-700 mt-1">{userProfile.lastUpload ? new Date(userProfile.lastUpload).toLocaleDateString() : 'Never'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">Created</div>
                  <div className="text-xs font-semibold text-emerald-700 mt-1">{new Date(userProfile.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">{userProfile ? 'Update Profile' : 'Create Your Profile'}</h2>
                <p className="text-sm text-slate-500">{userProfile ? 'Update your details and upload additional documents.' : 'Verify personal details and upload student documents.'}</p>
              </div>
              <button
                onClick={handleProfileUpload}
                disabled={profileUploading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-60"
              >
                {profileUploading ? 'Uploading...' : userProfile ? 'Update Profile' : 'Create Profile'}
              </button>
            </div>

          {profileError && (
            <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center gap-3">
              <AlertCircle size={18} />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-3">
              <CheckCircle size={18} />
              <span>{profileSuccess}</span>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase">Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase">Mobile</label>
              <input
                type="tel"
                value={profileData.mobile}
                onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter mobile number"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase">Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase">Aadhar</label>
              <input
                type="text"
                value={profileData.aadhar}
                onChange={(e) => setProfileData({ ...profileData, aadhar: e.target.value })}
                className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter Aadhar number"
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Required Documents</h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'marksheet', label: 'Marksheet' },
                { key: 'certificate', label: 'Certificate / Provisional' },
                { key: 'transcript', label: 'Transcript' },
                { key: 'consolidated', label: 'Consolidated Marks Memo' },
                { key: 'resume', label: 'Resume' },
                { key: 'sop', label: 'Statement of Purpose' },
                { key: 'passport', label: 'Passport' }
              ].map((doc) => (
                <label key={doc.key} className="flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-xs font-bold text-slate-700">{doc.label}</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setDocFiles({
                      ...docFiles,
                      [doc.key]: e.target.files?.[0] || null
                    })}
                    className="text-xs"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">LOR Documents</h3>
              <button
                onClick={() => setLorFiles((prev) => [...prev, null])}
                className="flex items-center gap-2 text-xs font-bold text-indigo-600"
              >
                <Plus size={14} /> Add Another LOR
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {lorFiles.map((file, idx) => (
                <label key={idx} className="flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-xs font-bold text-slate-700">LOR #{idx + 1}</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const next = [...lorFiles];
                      next[idx] = e.target.files?.[0] || null;
                      setLorFiles(next);
                    }}
                    className="text-xs"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
        </>
      )}

      {/* Toolbar & Filter Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter size={18} />
              Filters
            </button>
            {isAdmin && (
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm">
                <Download size={18} />
                Export
              </button>
            )}
            <button
              onClick={() => setShowAddLeadModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
            >
              <Plus size={18} />
              Add Lead
            </button>
          </div>
        </div>

        {/* Expandable Filter Section */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-top-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Source</label>
              <select 
                className="w-full text-xs font-semibold bg-slate-50 border-none rounded-lg p-2"
                value={filters.source}
                onChange={e => setFilters({...filters, source: e.target.value})}
              >
                <option value="">All Sources</option>
                <option value="WHATSAPP_AI">WhatsApp AI</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="TELECALLER_SHEET">Telecaller Sheet</option>
                <option value="FIELD_MARKETING">Field Marketing</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="GOOGLE_ADS">Google Ads</option>
                <option value="REFERRAL">Referral</option>
                <option value="MANUAL_ENTRY">Manual Entry</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Pipeline</label>
              <select 
                className="w-full text-xs font-semibold bg-slate-50 border-none rounded-lg p-2"
                value={filters.pipeline}
                onChange={e => setFilters({...filters, pipeline: e.target.value})}
              >
                <option value="">All Stages</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="COUNSELING">Counseling</option>
                <option value="APPLIED">Applied</option>
                <option value="OFFER">Offer</option>
                <option value="CONVERTED">Converted</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
              <select 
                className="w-full text-xs font-semibold bg-slate-50 border-none rounded-lg p-2"
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => setFilters({source:'', pipeline:'', status:''})}
                className="w-full py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content View */}
      <div className="flex-1 min-h-0 relative">
        {error && (
          <div className="mb-4 flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
            <AlertCircle className="text-rose-600" size={20} />
            <div>
              <div className="font-bold text-rose-900">{error}</div>
              <div className="text-xs text-rose-700">Please check the database connection</div>
            </div>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center h-96 text-slate-400">
            <div className="text-center">
              <div className="animate-spin mb-2">⚙️</div>
              <div className="text-sm font-semibold">Loading leads...</div>
            </div>
          </div>
        )}
        {!loading && !error && view === 'table' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                    <th className="px-6 py-4 w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                        onChange={selectAll}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Pipeline</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Score</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Country/Program</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Source</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Follow-up</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.length > 0 ? filteredLeads.map((lead) => {
                    const leadId = lead._id || lead.id;
                    return (
                    <tr 
                      key={leadId} 
                      className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${leadId && selectedLeads.includes(leadId) ? 'bg-indigo-50/30' : ''}`}
                      onClick={() => openLeadDetails(lead)}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={leadId ? selectedLeads.includes(leadId) : false}
                          onChange={() => leadId && toggleLeadSelection(leadId)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center font-black text-white">
                              {(lead.name ?? '?').charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{lead.name || 'Unnamed'}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{lead.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${getPipelineColor(lead.pipeline)}`}>
                          {lead.pipeline || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${getScoreBadgeColor(lead.qualificationScore)}`}>
                          {lead.qualificationScore}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[11px] font-bold text-slate-700">{lead.interestedCountries?.join(', ') || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{lead.interestedPrograms?.join(', ') || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                          {lead.source?.replace(/_/g, ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[11px] font-bold text-slate-700">
                          {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : 'Not set'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && leadId && (
                            <button
                              onClick={() => openAssignModal([leadId])}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100"
                            >
                              <UserPlus size={18} />
                            </button>
                          )}
                          <div className="relative">
                            <button 
                              onClick={() => setOpenDropdown(openDropdown === leadId ? null : leadId || null)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100"
                            >
                              <MoreHorizontal size={18} />
                            </button>
                            {openDropdown === leadId && (
                              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                                <button
                                  onClick={() => {
                                    openLeadDetails(lead);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                                >
                                  <ChevronRight size={14} />
                                  View Details
                                </button>
                                <div className="border-t border-slate-100 my-1"></div>
                                <button
                                  onClick={() => handleCallLead(lead.phone)}
                                  className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                                >
                                  <Phone size={14} />
                                  Call {lead.phone}
                                </button>
                                <button
                                  onClick={() => handleEmailLead(lead.email)}
                                  className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                                >
                                  <Mail size={14} />
                                  Send Email
                                </button>
                                <button
                                  onClick={() => handleCopyPhone(lead.phone)}
                                  className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                >
                                  <Copy size={14} />
                                  Copy Phone
                                </button>
                                {isAdmin && leadId && (
                                  <>
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <button
                                      onClick={() => {
                                        openAssignModal([leadId]);
                                        setOpenDropdown(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                                    >
                                      <UserPlus size={14} />
                                      Assign Lead
                                    </button>
                                    <button
                                      onClick={() => handleDuplicateLead(lead)}
                                      className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-2"
                                    >
                                      <Copy size={14} />
                                      Duplicate Lead
                                    </button>
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <div className="px-2 py-1">
                                      <div className="text-xs font-bold text-slate-500 px-2 mb-1">Change Status</div>
                                      <button
                                        onClick={() => handleUpdateLeadStatus(leadId, 'NEW')}
                                        className="w-full px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-sky-50 transition-colors rounded"
                                      >
                                        → New
                                      </button>
                                      <button
                                        onClick={() => handleUpdateLeadStatus(leadId, 'CONTACTED')}
                                        className="w-full px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-blue-50 transition-colors rounded"
                                      >
                                        → Contacted
                                      </button>
                                      <button
                                        onClick={() => handleUpdateLeadStatus(leadId, 'QUALIFIED')}
                                        className="w-full px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-indigo-50 transition-colors rounded"
                                      >
                                        → Qualified
                                      </button>
                                      <button
                                        onClick={() => handleUpdateLeadStatus(leadId, 'COUNSELING')}
                                        className="w-full px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-purple-50 transition-colors rounded"
                                      >
                                        → Counseling
                                      </button>
                                      <button
                                        onClick={() => handleUpdateLeadStatus(leadId, 'APPLIED')}
                                        className="w-full px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-amber-50 transition-colors rounded"
                                      >
                                        → Applied
                                      </button>
                                      <button
                                        onClick={() => handleUpdateLeadStatus(leadId, 'OFFER')}
                                        className="w-full px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-violet-50 transition-colors rounded"
                                      >
                                        → Offer
                                      </button>
                                    </div>
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <button
                                      onClick={() => handleMarkAsConverted(leadId)}
                                      className="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center gap-2"
                                    >
                                      <CheckCircle size={14} />
                                      Mark as Converted
                                    </button>
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <button
                                      onClick={() => handleDeleteLead(leadId)}
                                      className="w-full px-4 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                    >
                                      <Trash2 size={14} />
                                      Delete Lead
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );}) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-slate-400">
                            <Flag size={32} />
                          </div>
                          <div className="text-slate-500 font-bold">No leads found</div>
                          <div className="text-xs text-slate-400">Try adjusting your filters</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {!loading && !error && view === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-4 h-full scrollbar-hide">
            {['NEW', 'CONTACTED', 'QUALIFIED', 'COUNSELING', 'APPLIED', 'OFFER', 'CONVERTED'].map((stage) => {
              const leadsInStage = leads.filter(l => l.pipeline === stage && 
                (!filters.source || l.source === filters.source) &&
                (!filters.pipeline || l.pipeline === filters.pipeline) &&
                (!filters.status || l.status === filters.status));
              return (
                <div key={stage} className="flex-shrink-0 w-80 flex flex-col gap-3">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{stage}</span>
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{leadsInStage.length}</span>
                    </div>
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  
                  <div className="flex-1 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-2 space-y-3 overflow-y-auto">
                    {leadsInStage.map(lead => (
                      <div 
                        key={lead._id || lead.id} 
                        onClick={() => openLeadDetails(lead)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-300 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-full ${getScoreBadgeColor(lead.qualificationScore)}`}>{lead.qualificationScore}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lead.source?.split('_')[0] || 'N/A'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 mb-1">{lead.name || 'Unnamed'}</h4>
                        <p className="text-[10px] text-slate-500 mb-3">{lead.interestedPrograms?.join(', ') || 'N/A'}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">{lead.interestedCountries?.[0] || 'N/A'}</div>
                          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                            {(lead.name ?? '?').charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {!loading && !error && view === 'calendar' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 uppercase tracking-widest">Follow-up Schedule</h3>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-slate-400">May 2024</span>
                <div className="flex border rounded-lg overflow-hidden">
                  <button className="px-3 py-1 bg-slate-50 hover:bg-slate-100">&lt;</button>
                  <button className="px-3 py-1 bg-white hover:bg-slate-50 border-x">Today</button>
                  <button className="px-3 py-1 bg-slate-50 hover:bg-slate-100">&gt;</button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
              {['2024-05-18', '2024-05-20', '2024-05-21', '2024-05-22'].map(date => {
                const leadsForDate = filteredLeads.filter(l => l.followUpDate === date);
                return (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-black text-slate-900">{new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'short' })}</div>
                      <div className="flex-1 h-px bg-slate-100"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {leadsForDate.map(lead => (
                        <div 
                          key={lead._id || lead.id} 
                          onClick={() => openLeadDetails(lead)}
                          className="flex items-center gap-3 p-3 bg-slate-50/50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 transition-all cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                            {(lead.name ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">{lead.name || 'Unnamed'}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{lead.interestedPrograms?.join(', ') || 'N/A'}</div>
                          </div>
                          <div className="ml-auto">
                             <ChevronRight size={14} className="text-slate-300" />
                          </div>
                        </div>
                      ))}
                      {leadsForDate.length === 0 && <div className="text-[10px] font-bold text-slate-300 italic">No tasks scheduled</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedLeads.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-8">
          <div className="flex items-center gap-2 pr-6 border-r border-slate-700">
            <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black">{selectedLeads.length}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Selected</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => openAssignModal(selectedLeads)}
              className="flex items-center gap-2 hover:text-indigo-400 transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <UserPlus size={14} /> Assign
            </button>
            <button className="flex items-center gap-2 hover:text-indigo-400 transition-colors text-xs font-bold uppercase tracking-widest">
              <CheckCircle size={14} /> Stage
            </button>
            <button className="flex items-center gap-2 hover:text-rose-400 transition-colors text-xs font-bold uppercase tracking-widest">
              <Trash2 size={14} /> Delete
            </button>
            <div className="w-px h-4 bg-slate-700"></div>
            <button 
              onClick={() => setSelectedLeads([])}
              className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showLeadModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedLead.name || 'Lead Details'}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase">Source: {selectedLead.source?.replace(/_/g, ' ') || 'Unknown'}</p>
              </div>
              <button onClick={() => setShowLeadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Contact</div>
                <div className="text-sm font-semibold text-slate-900">{selectedLead.email || 'No email'}</div>
                <div className="text-sm font-semibold text-slate-900">{selectedLead.phone || 'No phone'}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase pt-2">Pipeline</div>
                <div className="text-sm font-semibold text-slate-900">{selectedLead.pipeline || 'UNKNOWN'}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase pt-2">Status</div>
                <div className="text-sm font-semibold text-slate-900">{selectedLead.status || 'ACTIVE'}</div>
              </div>
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Created</div>
                <div className="text-sm font-semibold text-slate-900">{selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleString() : 'N/A'}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase pt-2">Last Updated</div>
                <div className="text-sm font-semibold text-slate-900">{selectedLead.updatedAt ? new Date(selectedLead.updatedAt).toLocaleString() : 'N/A'}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase pt-2">Follow-up</div>
                <div className="text-sm font-semibold text-slate-900">{selectedLead.followUpDate ? new Date(selectedLead.followUpDate).toLocaleDateString() : 'Not set'}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase pt-2">Assigned To</div>
                <div className="text-sm font-semibold text-slate-900">
                  {users.find(u => (u.id || u._id) === selectedLead.assignedTo)?.name || 'Unassigned'}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              {isAdmin && (selectedLead._id || selectedLead.id) && (
                <button
                  onClick={() => {
                    const leadId = selectedLead._id || selectedLead.id;
                    if (leadId) openAssignModal([leadId]);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"
                >
                  Assign Lead
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Leads Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">Assign Leads</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Selected leads: {assignmentTargetIds.length}</p>
            <select
              value={assignmentUserId}
              onChange={(e) => setAssignmentUserId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Select staff member</option>
              {users.map((u) => (
                <option key={u.id || u._id} value={u.id || u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleAssignLeads}
                disabled={!assignmentUserId || assigning}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-60"
              >
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">Add New Lead</h3>
              <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full name"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Phone"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="MANUAL_ENTRY">Manual Entry</option>
                  <option value="WHATSAPP_AI">WhatsApp AI</option>
                  <option value="SOCIAL_MEDIA">Social Media</option>
                  <option value="TELECALLER_SHEET">Telecaller Sheet</option>
                  <option value="FIELD_MARKETING">Field Marketing</option>
                  <option value="REFERRAL">Referral</option>
                </select>
                <select
                  value={newLead.pipeline}
                  onChange={(e) => setNewLead({ ...newLead, pipeline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="COUNSELING">Counseling</option>
                  <option value="APPLIED">Applied</option>
                  <option value="OFFER">Offer</option>
                  <option value="CONVERTED">Converted</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddLeadModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleCreateLead}
                disabled={creatingLead}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-60"
              >
                {creatingLead ? 'Creating...' : 'Create Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement;
