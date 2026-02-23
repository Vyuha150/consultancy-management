
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, Search, Filter, Plus, CheckCircle2, Clock, AlertCircle, 
  MoreVertical, X, Trash2, Calendar, Eye, Edit2, Flag, Zap,
  UserPlus, Copy, FileText, ArrowRight
} from 'lucide-react';

interface Assignment {
  id?: string;
  _id?: string;
  leadId: string;
  leadName: string;
  assignedTo: string;
  assignedToName: string;
  status: string;
  priority: string;
  notes: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

interface ProjectAssignmentCenterProps {
  onLeadClick?: (lead: any) => void;
}

const ProjectAssignmentCenter: React.FC<ProjectAssignmentCenterProps> = ({ onLeadClick }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'table' | 'board'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    leadId: '',
    leadName: '',
    assignedTo: '',
    assignedToName: '',
    priority: 'MEDIUM',
    notes: '',
    dueDate: ''
  });

  // Fetch assignments from database
  useEffect(() => {
    fetchAssignments();
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (statusFilter) query.append('status', statusFilter);
      if (priorityFilter) query.append('priority', priorityFilter);

      const response = await fetch(`/api/assignments?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load assignments');
      }
    } catch (err) {
      setError('Error fetching assignments');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
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

  const handleCreateAssignment = async () => {
    if (!assignmentForm.leadName || !assignmentForm.assignedToName) {
      alert('Please fill in required fields');
      return;
    }

    setAssignmentLoading(true);
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: assignmentForm.leadId,
          leadName: assignmentForm.leadName,
          assignedTo: assignmentForm.assignedTo,
          assignedToName: assignmentForm.assignedToName,
          priority: assignmentForm.priority,
          notes: assignmentForm.notes,
          dueDate: assignmentForm.dueDate,
          status: 'PENDING'
        })
      });

      if (response.ok) {
        alert('Assignment created successfully!');
        setShowAssignmentModal(false);
        setAssignmentForm({
          leadId: '',
          leadName: '',
          assignedTo: '',
          assignedToName: '',
          priority: 'MEDIUM',
          notes: '',
          dueDate: ''
        });
        fetchAssignments();
      } else {
        alert('Failed to create assignment');
      }
    } catch (err) {
      alert('Error creating assignment');
      console.error(err);
    } finally {
      setAssignmentLoading(false);
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      const search = searchTerm.toLowerCase();
      const leadName = (a.leadName ?? '').toLowerCase();
      const assigneeName = (a.assignedToName ?? '').toLowerCase();
      const matchesSearch = leadName.includes(search) || assigneeName.includes(search);
      return matchesSearch;
    });
  }, [searchTerm, assignments]);

  const stats = useMemo(() => {
    return {
      total: assignments.length,
      completed: assignments.filter(a => a.status === 'COMPLETED').length,
      inProgress: assignments.filter(a => a.status === 'IN_PROGRESS').length,
      pending: assignments.filter(a => a.status === 'PENDING').length,
      overdue: assignments.filter(a => {
        if (a.dueDate && a.status !== 'COMPLETED') {
          return new Date(a.dueDate) < new Date();
        }
        return false;
      }).length
    };
  }, [assignments]);

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setAssignments(assignments.filter(a => (a._id || a.id) !== assignmentId));
        setOpenDropdown(null);
        alert('Assignment deleted successfully');
      } else {
        alert('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      alert('Error deleting assignment');
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      leadId: assignment.leadId,
      leadName: assignment.leadName,
      assignedTo: assignment.assignedTo,
      assignedToName: assignment.assignedToName,
      priority: assignment.priority,
      notes: assignment.notes,
      dueDate: assignment.dueDate
    });
    setShowAssignmentModal(true);
    setOpenDropdown(null);
  };

  const handleUpdateAssignmentStatus = async (assignmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setAssignments(assignments.map(a => 
          (a._id || a.id) === assignmentId ? { ...a, status: newStatus } : a
        ));
        setOpenDropdown(null);
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Error updating status');
    }
  };

  const handleSaveAssignment = async () => {
    if (!assignmentForm.leadId || !assignmentForm.assignedTo) {
      alert('Please fill in all required fields');
      return;
    }

    setAssignmentLoading(true);
    try {
      if (editingAssignment) {
        // Update existing assignment
        const response = await fetch(`/api/assignments/${editingAssignment._id || editingAssignment.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignedTo: assignmentForm.assignedTo,
            priority: assignmentForm.priority,
            notes: assignmentForm.notes,
            dueDate: assignmentForm.dueDate
          })
        });

        if (response.ok) {
          const updatedAssignment = await response.json();
          setAssignments(assignments.map(a => 
            (a._id || a.id) === (editingAssignment._id || editingAssignment.id) ? updatedAssignment : a
          ));
          setShowAssignmentModal(false);
          setEditingAssignment(null);
        } else {
          alert('Failed to update assignment');
        }
      } else {
        // Create new assignment - existing logic
        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignmentForm)
        });

        if (response.ok) {
          setShowAssignmentModal(false);
          setAssignmentForm({
            leadId: '',
            leadName: '',
            assignedTo: '',
            assignedToName: '',
            priority: 'MEDIUM',
            notes: '',
            dueDate: ''
          });
          fetchAssignments();
        } else {
          alert('Failed to create assignment');
        }
      }
    } catch (err) {
      alert('Error saving assignment');
      console.error(err);
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleChangePriority = async (assignmentId: string, newPriority: string) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority })
      });

      if (response.ok) {
        setAssignments(assignments.map(a => 
          (a._id || a.id) === assignmentId ? { ...a, priority: newPriority } : a
        ));
        setOpenDropdown(null);
      } else {
        alert('Failed to update priority');
      }
    } catch (error) {
      console.error('Failed to update priority:', error);
      alert('Error updating priority');
    }
  };

  const handleDuplicateAssignment = async (assignment: Assignment) => {
    try {
      const newAssignment = {
        leadId: assignment.leadId,
        leadName: assignment.leadName,
        assignedTo: assignment.assignedTo,
        assignedToName: assignment.assignedToName,
        priority: assignment.priority,
        notes: `(Copy) ${assignment.notes}`,
        dueDate: assignment.dueDate
      };

      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment)
      });

      if (response.ok) {
        fetchAssignments();
        setOpenDropdown(null);
        alert('Assignment duplicated successfully');
      } else {
        alert('Failed to duplicate assignment');
      }
    } catch (error) {
      console.error('Failed to duplicate assignment:', error);
      alert('Error duplicating assignment');
    }
  };

  const handleViewLead = (leadId: string) => {
    if (onLeadClick) {
      const lead = leads.find(l => (l._id || l.id) === leadId);
      if (lead) {
        onLeadClick(lead);
        setOpenDropdown(null);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PENDING': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'OVERDUE': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={16} />;
      case 'IN_PROGRESS': return <Clock size={16} />;
      case 'PENDING': return <AlertCircle size={16} />;
      default: return <Flag size={16} />;
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-widest">Assignments</h1>
          <p className="text-xs text-slate-400 font-bold mt-1">Manage lead assignments and track progress</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100" onClick={() => setShowAssignmentModal(true)}>
          <Plus size={18} />
          New Assignment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{stats.total}</div>
          <div className="text-xs text-slate-500 mt-2">All assignments</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-2xl border border-green-200 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase">
            <CheckCircle2 size={14} />
            Completed
          </div>
          <div className="text-3xl font-black text-green-700 mt-1">{stats.completed}</div>
          <div className="text-xs text-green-600 mt-2">{stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : 0}% done</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl border border-blue-200 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase">
            <Clock size={14} />
            In Progress
          </div>
          <div className="text-3xl font-black text-blue-700 mt-1">{stats.inProgress}</div>
          <div className="text-xs text-blue-600 mt-2">Active tasks</div>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Pending</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{stats.pending}</div>
          <div className="text-xs text-slate-500 mt-2">Not started</div>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-white p-4 rounded-2xl border border-rose-200 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-bold text-rose-600 uppercase">
            <AlertCircle size={14} />
            Overdue
          </div>
          <div className="text-3xl font-black text-rose-700 mt-1">{stats.overdue}</div>
          <div className="text-xs text-rose-600 mt-2">Past due date</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text"
          placeholder="Search by student name or assigned to..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 text-sm font-semibold bg-transparent border-none focus:ring-0 outline-none text-slate-700 placeholder-slate-400"
        />
        <div className="flex items-center gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setActiveView('table')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
            activeView === 'table' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          List View
        </button>
        <button 
          onClick={() => setActiveView('board')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
            activeView === 'board' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Board View
        </button>
      </div>

      {/* Content Area */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
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
            <div className="text-sm font-semibold">Loading assignments...</div>
          </div>
        </div>
      )}

      {!loading && !error && activeView === 'table' && (
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Lead</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned To</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Priority</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.length > 0 ? filteredAssignments.map((assignment) => (
                  <tr 
                    key={assignment._id || assignment.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedAssignmentId(assignment._id || assignment.id || null)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                          {(assignment.leadName ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600">{assignment.leadName || 'Unknown Lead'}</div>
                          <div className="text-[10px] text-slate-400">ID: {assignment.leadId?.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">{assignment.assignedToName}</div>
                      <div className="text-[10px] text-slate-400">Assigned</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-bold w-fit ${getStatusColor(assignment.status)}`}>
                        {getStatusIcon(assignment.status)}
                        {assignment.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold w-fit block ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                        <Calendar size={14} className="text-slate-400" />
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === (assignment._id || assignment.id) ? null : (assignment._id || assignment.id));
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openDropdown === (assignment._id || assignment.id) && (
                          <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-100 rounded-lg shadow-lg z-50 py-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewLead(assignment.leadId);
                              }}
                              className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                            >
                              <Eye size={14} />
                              View Lead Details
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <div className="px-2 py-1">
                              <div className="text-xs font-bold text-slate-500 px-2 mb-1">Update Status</div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateAssignmentStatus(assignment._id || assignment.id || '', 'PENDING');
                                }}
                                className="w-full px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors rounded"
                              >
                                → Pending
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateAssignmentStatus(assignment._id || assignment.id || '', 'IN_PROGRESS');
                                }}
                                className="w-full px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-blue-50 transition-colors rounded"
                              >
                                → In Progress
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateAssignmentStatus(assignment._id || assignment.id || '', 'COMPLETED');
                                }}
                                className="w-full px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-green-50 transition-colors rounded"
                              >
                                → Completed
                              </button>
                            </div>
                            <div className="border-t border-slate-100 my-1"></div>
                            <div className="px-2 py-1">
                              <div className="text-xs font-bold text-slate-500 px-2 mb-1">Change Priority</div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChangePriority(assignment._id || assignment.id || '', 'HIGH');
                                }}
                                className="w-full px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-rose-50 transition-colors rounded"
                              >
                                → High Priority
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChangePriority(assignment._id || assignment.id || '', 'MEDIUM');
                                }}
                                className="w-full px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-amber-50 transition-colors rounded"
                              >
                                → Medium Priority
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChangePriority(assignment._id || assignment.id || '', 'LOW');
                                }}
                                className="w-full px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-blue-50 transition-colors rounded"
                              >
                                → Low Priority
                              </button>
                            </div>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAssignment(assignment);
                              }}
                              className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                              <Edit2 size={14} />
                              Edit Assignment
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateAssignment(assignment);
                              }}
                              className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-2"
                            >
                              <Copy size={14} />
                              Duplicate
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAssignment(assignment._id || assignment.id || '');
                              }}
                              className="w-full text-left px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList size={32} className="text-slate-300" />
                        <div className="text-slate-500 font-bold">No assignments found</div>
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

      {!loading && !error && activeView === 'board' && (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((status) => {
            const statusAssignments = filteredAssignments.filter(a => a.status === status);
            return (
              <div key={status} className="flex-shrink-0 w-96 flex flex-col gap-3">
                <div className="flex items-center justify-between px-4">
                  <h3 className="font-bold text-slate-900 uppercase text-sm tracking-widest">{status}</h3>
                  <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{statusAssignments.length}</span>
                </div>
                <div className="flex-1 bg-slate-50 rounded-2xl p-3 space-y-3 overflow-y-auto">
                  {statusAssignments.map((a) => (
                    <div 
                      key={a._id || a.id}
                      className="bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 text-sm">{a.leadName}</h4>
                        <span className={`px-2 py-1 rounded text-[9px] font-bold ${getPriorityColor(a.priority)}`}>{a.priority}</span>
                      </div>
                      <div className="text-xs text-slate-500 mb-3">Assigned to: {a.assignedToName}</div>
                      {a.dueDate && (
                        <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(a.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {a.notes && (
                        <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded mb-3 border border-slate-100">
                          {a.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</h2>
              <button 
                onClick={() => {
                  setShowAssignmentModal(false);
                  setEditingAssignment(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Lead *</label>
                <select
                  value={assignmentForm.leadId}
                  onChange={(e) => {
                    const selectedLead = leads.find(l => (l._id || l.id) === e.target.value);
                    setAssignmentForm({
                      ...assignmentForm,
                      leadId: e.target.value,
                      leadName: selectedLead?.name || ''
                    });
                  }}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                >
                  <option value="">Select lead</option>
                  {leads.map((lead) => (
                    <option key={lead._id || lead.id} value={lead._id || lead.id}>
                      {lead.name} ({lead.source?.replace(/_/g, ' ') || 'Unknown'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Assign To *</label>
                <select
                  value={assignmentForm.assignedTo}
                  onChange={(e) => {
                    const selectedUser = users.find(u => (u._id || u.id) === e.target.value);
                    setAssignmentForm({
                      ...assignmentForm,
                      assignedTo: e.target.value,
                      assignedToName: selectedUser?.name || ''
                    });
                  }}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                >
                  <option value="">Select staff</option>
                  {users.map((user) => (
                    <option key={user._id || user.id} value={user._id || user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Priority</label>
                <select 
                  value={assignmentForm.priority}
                  onChange={(e) => setAssignmentForm({...assignmentForm, priority: e.target.value})}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Due Date</label>
                <input 
                  type="date"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Notes</label>
                <textarea 
                  placeholder="Add any notes or instructions..."
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm({...assignmentForm, notes: e.target.value})}
                  rows={4}
                  className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setEditingAssignment(null);
                    setAssignmentForm({
                      leadId: '',
                      leadName: '',
                      assignedTo: '',
                      assignedToName: '',
                      priority: 'MEDIUM',
                      notes: '',
                      dueDate: ''
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveAssignment}
                  disabled={assignmentLoading}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {assignmentLoading ? '...' : (editingAssignment ? <Edit2 size={16} /> : <Plus size={16} />)}
                  {assignmentLoading ? 'Saving...' : (editingAssignment ? 'Update Assignment' : 'Create Assignment')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectAssignmentCenter;
