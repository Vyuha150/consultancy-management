
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  Plus, 
  ChevronRight,
  User,
  Calendar,
  CheckCircle2,
  Trash2,
  Flag,
  ArrowRight,
  X

} from 'lucide-react';
import { MOCK_TASKS, MOCK_USERS } from '../constants';
import { Task, UserRole } from '../types';

interface TaskManagerProps {
  currentUserRole: UserRole;
  currentUserId: string;
}

const TaskManager: React.FC<TaskManagerProps> = ({ currentUserRole, currentUserId }) => {
  const [view, setView] = useState<'my' | 'admin'>('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'FOLLOW_UP',
    leadName: '',
    dueDate: '',
    priority: 'MEDIUM',
    assignedTo: '',
    description: ''
  });

  const isAdmin = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.SUPER_ADMIN;

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await fetch('/api/users?status=ACTIVE');
      if (response.ok) {
        const data = await response.json();
        setEmployees(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      // Fallback to mock data
      setEmployees(MOCK_USERS);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Group employees by role for better organization
  const groupedEmployees = useMemo(() => {
    const groups: Record<string, any[]> = {
      [UserRole.TELECALLER]: [],
      [UserRole.COUNSELOR]: [],
      [UserRole.FIELD_MARKETING]: [],
      [UserRole.SOCIAL_MEDIA]: [],
      [UserRole.AI_OPERATOR]: [],
      [UserRole.AGENT_MANAGER]: [],
      'OTHER': []
    };

    employees.forEach(emp => {
      if (groups[emp.role]) {
        groups[emp.role].push(emp);
      } else {
        groups['OTHER'].push(emp);
      }
    });

    return groups;
  }, [employees]);

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.assignedTo) {
      alert('Please fill in task title and assignee');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        alert('Task created successfully!');
        setShowCreateTaskModal(false);
        setNewTask({
          title: '',
          type: 'FOLLOW_UP',
          leadName: '',
          dueDate: '',
          priority: 'MEDIUM',
          assignedTo: '',
          description: ''
        });
        // Refresh employees list
        fetchEmployees();
      } else {
        alert('Failed to create task');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };

  const filteredTasks = useMemo(() => {
    let tasks = MOCK_TASKS;
    if (view === 'my' && !isAdmin) {
      tasks = tasks.filter(t => t.assignedTo === currentUserId);
    }
    return tasks.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.leadName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [view, isAdmin, currentUserId, searchTerm]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-rose-600 bg-rose-50';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50';
      default: return 'text-sky-600 bg-sky-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={18} className="text-emerald-500" />;
      case 'OVERDUE': return <AlertCircle size={18} className="text-rose-500" />;
      default: return <Clock size={18} className="text-slate-300" />;
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Task Command</h1>
          <p className="text-sm text-slate-500 font-medium">Coordinate follow-ups and track performance SLAs.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
              <button 
                onClick={() => setView('my')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'my' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                My Tasks
              </button>
              <button 
                onClick={() => setView('admin')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Admin Board
              </button>
            </div>
          )}
          <button 
            onClick={() => setShowCreateTaskModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
          >
            <Plus size={16} /> Create Task
          </button>
        </div>
      </div>

      {/* Task Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by task title or lead name..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm font-medium text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600">
             <Filter size={16} /> Filters
           </button>
           <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 uppercase tracking-widest">
             <Calendar size={16} /> May 2024
           </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Detail</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Lead</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                {isAdmin && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned To</th>}
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        {getStatusIcon(task.status)}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{task.title}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{task.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-black text-slate-500 uppercase">
                        {task.leadName?.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{task.leadName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`text-xs font-bold ${task.status === 'OVERDUE' ? 'text-rose-600' : 'text-slate-600'}`}>
                      {task.dueDate}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">
                          {MOCK_USERS.find(u => u.id === task.assignedTo)?.name}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-2 bg-white border border-slate-100 rounded-lg text-emerald-600 hover:shadow-md transition-all" title="Mark Complete">
                         <CheckCircle2 size={16} />
                       </button>
                       <button className="p-2 bg-white border border-slate-100 rounded-lg text-rose-500 hover:shadow-md transition-all" title="Delete">
                         <Trash2 size={16} />
                       </button>
                       <button className="p-2 bg-white border border-slate-100 rounded-lg text-slate-400 hover:shadow-md transition-all">
                         <MoreVertical size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTasks.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium">
              <CheckSquare size={48} className="mx-auto mb-4 opacity-10" />
              No tasks found for the current view.
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Create New Task</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {employees.length > 0 ? `${employees.length} employees available for assignment` : 'Loading employee list...'}
                </p>
              </div>
              <button
                onClick={() => setShowCreateTaskModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Task Title *</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Assign To Employee *</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  disabled={loadingEmployees}
                >
                  <option value="">{loadingEmployees ? 'Loading employees...' : 'Select an employee...'}</option>
                  
                  {groupedEmployees[UserRole.TELECALLER].length > 0 && (
                    <optgroup label="📞 Telecallers">
                      {groupedEmployees[UserRole.TELECALLER].map(user => (
                        <option key={user.id || user._id} value={user.id || user._id}>
                          {user.name} - {user.email}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {groupedEmployees[UserRole.COUNSELOR].length > 0 && (
                    <optgroup label="🎓 Counselors">
                      {groupedEmployees[UserRole.COUNSELOR].map(user => (
                        <option key={user.id || user._id} value={user.id || user._id}>
                          {user.name} - {user.email}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {groupedEmployees[UserRole.FIELD_MARKETING].length > 0 && (
                    <optgroup label="👥 Field Marketing">
                      {groupedEmployees[UserRole.FIELD_MARKETING].map(user => (
                        <option key={user.id || user._id} value={user.id || user._id}>
                          {user.name} - {user.email}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {groupedEmployees[UserRole.SOCIAL_MEDIA].length > 0 && (
                    <optgroup label="📱 Social Media">
                      {groupedEmployees[UserRole.SOCIAL_MEDIA].map(user => (
                        <option key={user.id || user._id} value={user.id || user._id}>
                          {user.name} - {user.email}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {groupedEmployees[UserRole.AI_OPERATOR].length > 0 && (
                    <optgroup label="🔧 AI Operators">
                      {groupedEmployees[UserRole.AI_OPERATOR].map(user => (
                        <option key={user.id || user._id} value={user.id || user._id}>
                          {user.name} - {user.email}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {groupedEmployees[UserRole.AGENT_MANAGER].length > 0 && (
                    <optgroup label="🤖 AI Managers">
                      {groupedEmployees[UserRole.AGENT_MANAGER].map(user => (
                        <option key={user.id || user._id} value={user.id || user._id}>
                          {user.name} - {user.email}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {groupedEmployees['OTHER'].length > 0 && (
                    <optgroup label="👤 Other Staff">
                      {groupedEmployees['OTHER'].map(user => (
                        <option key={user.id || user._id} value={user.id || user._id}>
                          {user.name} - {user.email}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  Assign task to any employee based on their role and expertise
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Lead Name</label>
                <input
                  type="text"
                  placeholder="Enter associated lead name"
                  value={newTask.leadName}
                  onChange={(e) => setNewTask({ ...newTask, leadName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Task Type</label>
                <select
                  value={newTask.type}
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="CALL">Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Description</label>
                <textarea
                  placeholder="Enter task details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateTask}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                >
                  Create Task
                </button>
                <button
                  onClick={() => setShowCreateTaskModal(false)}
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

export default TaskManager;
