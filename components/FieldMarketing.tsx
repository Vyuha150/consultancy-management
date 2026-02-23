
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  UserPlus,
  Tag,
  Smartphone,
  CheckCircle2,
  Clock,
  Navigation,
  Plus,
  ArrowLeft,
  Trash2,
  Eye,
  Loader,
  Search,
  Filter,
  FileText,
  Copy,
  Edit2,
  AlertCircle,
  X
} from 'lucide-react';
import { LeadSource, InterestLevel, UserRole } from '../types';

interface FieldMarketingProps {
  currentUserRole?: UserRole;
}

interface FieldLead {
  id?: string;
  _id?: string;
  name: string;
  phone: string;
  location: string;
  eventTag: string;
  interest: string;
  followUpDate: string;
  notes: string;
  status: string;
  assignedTo?: string;
  createdAt?: string;
}

interface SeminarForm {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  createdBy: string;
  createdAt?: string;
  isActive: boolean;
  responses?: number;
}

const FieldMarketing: React.FC<FieldMarketingProps> = ({ currentUserRole }) => {
  const [leads, setLeads] = useState<FieldLead[]>([]);
  const [forms, setForms] = useState<SeminarForm[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<FieldLead | null>(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'leads' | 'forms'>('leads');

  // Form State
  const [formData, setFormData] = useState<FieldLead>({
    name: '',
    phone: '',
    location: '',
    eventTag: 'School Seminar',
    interest: InterestLevel.WARM,
    followUpDate: '',
    notes: '',
    status: 'NEW',
    assignedTo: ''
  });

  const [newFormData, setNewFormData] = useState<SeminarForm>({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    createdBy: '',
    isActive: true,
    responses: 0
  });

  useEffect(() => {
    fetchLeads();
    fetchForms();
    fetchUsers();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/field-marketing/forms');
      if (response.ok) {
        const data = await response.json();
        setForms(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/field-marketing/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      alert('Name and phone are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/field-marketing/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setIsAddingLead(false);
          setFormData({
            name: '',
            phone: '',
            location: '',
            eventTag: 'School Seminar',
            interest: InterestLevel.WARM,
            followUpDate: '',
            notes: '',
            status: 'NEW',
            assignedTo: ''
          });
          fetchLeads();
        }, 2000);
      } else {
        alert('Failed to save lead');
      }
    } catch (error) {
      console.error('Failed to save lead:', error);
      alert('Failed to save lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newFormData.title || !newFormData.eventDate) {
      alert('Title and event date are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/field-marketing/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFormData,
          createdBy: currentUserRole
        })
      });

      if (response.ok) {
        alert('Seminar form created successfully!');
        setIsCreatingForm(false);
        setNewFormData({
          title: '',
          description: '',
          eventDate: '',
          location: '',
          createdBy: '',
          isActive: true,
          responses: 0
        });
        fetchForms();
      } else {
        alert('Failed to create form');
      }
    } catch (error) {
      console.error('Failed to create form:', error);
      alert('Error creating form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await fetch(`/api/field-marketing/leads?id=${leadId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setLeads(leads.filter(l => (l.id || l._id) !== leadId));
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete lead');
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm) ||
    lead.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 text-center">Lead Synced!</h2>
        <p className="text-slate-500 text-center mt-2 font-medium">The data has been uploaded to the central CRM pipeline.</p>
      </div>
    );
  }

  if (isAddingLead) {
    return (
      <div className="bg-white min-h-screen -m-4 md:-m-8 pb-20 animate-in slide-in-from-bottom-8 duration-500">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center gap-4 z-10">
          <button onClick={() => setIsAddingLead(false)} className="p-2 -ml-2 text-slate-400 hover:text-indigo-600">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-black text-slate-900">New Field Lead</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <UserPlus size={14} /> Basic Information
            </div>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Student Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="WhatsApp Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Tag size={14} /> Lead Context
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <Navigation className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600" size={18} />
                <input
                  type="text"
                  name="location"
                  placeholder="Location / School Name"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
                />
              </div>
              <select
                name="eventTag"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all appearance-none"
                value={formData.eventTag}
                onChange={handleInputChange}
              >
                <option>School Seminar</option>
                <option>Mall Stall</option>
                <option>Campus Visit</option>
                <option>Agent Meet</option>
                <option>Direct Referral</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100/50">
            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              <Calendar size={14} className="fill-current" /> Next Follow-up (Mandatory)
            </div>
            <input
              type="date"
              name="followUpDate"
              className="w-full px-5 py-4 bg-white border border-indigo-200 rounded-2xl text-base font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
              value={formData.followUpDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <FileText size={14} /> Field Observations
            </div>
            <textarea
              name="notes"
              placeholder="Any specific interests or doubts raised by the student..."
              className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-medium focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all resize-none"
              value={formData.notes}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <UserPlus size={14} /> Assign To
            </div>
            <select
              name="assignedTo"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all appearance-none"
              value={formData.assignedTo || ''}
              onChange={handleInputChange}
            >
              <option value="">-- Select Staff Member --</option>
              {users.map(user => (
                <option key={user._id || user.id} value={user._id || user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-indigo-600 text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Syncing...' : (
                <>
                  <CheckCircle2 size={20} /> Upload Lead
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsAddingLead(false)}
              className="w-full py-5 bg-white border-2 border-slate-100 text-slate-500 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (showLeadDetail && selectedLead) {
    return (
      <div className="bg-white min-h-screen -m-4 md:-m-8 pb-20">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center gap-4 z-10">
          <button onClick={() => { setShowLeadDetail(false); setSelectedLead(null); }} className="p-2 -ml-2 text-slate-400 hover:text-indigo-600">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-black text-slate-900">{selectedLead.name}</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Phone</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{selectedLead.phone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Interest Level</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{selectedLead.interest}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Location</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{selectedLead.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Event</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{selectedLead.eventTag}</p>
            </div>
          </div>

          {selectedLead.followUpDate && (
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Follow-up Date</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">
                {new Date(selectedLead.followUpDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {selectedLead.notes && (
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Notes</p>
              <p className="text-slate-700 mt-1">{selectedLead.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Field Marketing</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage leads, create seminar forms, and track metrics.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'leads' && (
            <button
              onClick={() => setIsAddingLead(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              <Plus size={18} />
              New Lead
            </button>
          )}
          {activeTab === 'forms' && (
            <button
              onClick={() => setIsCreatingForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
            >
              <Plus size={18} />
              Create Form
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
        {[
          { id: 'leads', label: 'Leads', icon: UserPlus },
          { id: 'forms', label: 'Seminar Forms', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'leads' | 'forms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leads Tab */}
      {activeTab === 'leads' && (
        <>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or location..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader size={32} className="text-indigo-600 animate-spin" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <MapPin size={48} className="mb-4 opacity-30" />
                <p className="font-semibold">No leads found</p>
                <p className="text-sm">Click "New Lead" to add your first field marketing lead</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Interest</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Follow-up</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredLeads.map((lead) => {
                      const leadId = lead.id || lead._id;
                      return (
                        <tr key={leadId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{lead.name}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{lead.phone}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{lead.location || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              lead.interest === 'HOT' ? 'bg-rose-100 text-rose-700' :
                              lead.interest === 'WARM' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {lead.interest}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{lead.eventTag}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setShowLeadDetail(true);
                                }}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Eye size={16} className="text-slate-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(leadId!)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Seminar Forms Tab */}
      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-16">
              <Loader size={32} className="text-indigo-600 animate-spin" />
            </div>
          ) : forms.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500">
              <FileText size={48} className="mb-4 opacity-30" />
              <p className="font-semibold">No forms created yet</p>
              <p className="text-sm">Click "Create Form" to create a new seminar form</p>
            </div>
          ) : (
            forms.map(form => (
              <div key={form._id || form.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 mb-2">{form.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{form.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${form.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {form.eventDate ? new Date(form.eventDate).toLocaleDateString() : 'No date'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    {form.location || 'No location'}
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={14} />
                    {form.responses || 0} responses
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm flex items-center justify-center gap-1">
                    <Eye size={14} /> View
                  </button>
                  <button className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm flex items-center justify-center gap-1">
                    <Copy size={14} /> Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Form Modal */}
      {isCreatingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Create Seminar Form</h3>
              <button onClick={() => setIsCreatingForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateForm} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Form Title *</label>
                <input 
                  type="text"
                  placeholder="E.g., Engineering Seminar - Delhi"
                  value={newFormData.title}
                  onChange={(e) => setNewFormData({ ...newFormData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                <textarea 
                  placeholder="Details about the seminar..."
                  value={newFormData.description}
                  onChange={(e) => setNewFormData({ ...newFormData, description: e.target.value })}
                  className="w-full h-24 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Event Date *</label>
                  <input 
                    type="date"
                    value={newFormData.eventDate}
                    onChange={(e) => setNewFormData({ ...newFormData, eventDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Location</label>
                  <input 
                    type="text"
                    placeholder="City/School"
                    value={newFormData.location}
                    onChange={(e) => setNewFormData({ ...newFormData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <input 
                  type="checkbox" 
                  id="active"
                  checked={newFormData.isActive}
                  onChange={(e) => setNewFormData({ ...newFormData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <label htmlFor="active" className="text-sm font-bold text-indigo-700">
                  Make this form active immediately
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsCreatingForm(false)}
                  className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold flex items-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? <Loader size={16} className="animate-spin" /> : <FileText size={16} />}
                  {isSubmitting ? 'Creating...' : 'Create Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldMarketing;

